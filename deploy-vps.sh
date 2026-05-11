#!/bin/bash

# Shaadi Bazaar - VPS Deployment Script (DigitalOcean/Linode/AWS)
# This script automates deployment to a VPS with PM2 + Nginx

set -e

echo "🚀 Starting Shaadi Bazaar Deployment to VPS..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
read -p "Enter your VPS IP address: " VPS_IP
read -p "Enter your VPS username (default: root): " VPS_USER
VPS_USER=${VPS_USER:-root}
read -p "Enter your domain name (e.g., shaadibazaar.pk): " DOMAIN_NAME
read -p "Enter your MongoDB Atlas URI: " MONGODB_URI
read -p "Enter your JWT secret: " JWT_SECRET

echo -e "\n${YELLOW}Configuration Summary:${NC}"
echo "VPS IP: $VPS_IP"
echo "VPS User: $VPS_USER"
echo "Domain: $DOMAIN_NAME"
echo "MongoDB: [configured]"

read -p "Continue with deployment? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# SSH connection function
ssh_cmd() {
    ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$VPS_USER@$VPS_IP" "$@"
}

# SCP function
scp_cmd() {
    scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$@"
}

echo -e "\n${YELLOW}Step 1: Connecting to VPS...${NC}"

if ! ssh_cmd "echo 'Connection test'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to VPS. Please check IP and credentials.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Connected to VPS${NC}"

echo -e "\n${YELLOW}Step 2: Installing system dependencies...${NC}"

ssh_cmd 'bash -s' << 'EOF'
set -e
echo "Updating system..."
apt update && apt upgrade -y

echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

echo "Installing PM2..."
npm install -g pm2

echo "Installing Nginx..."
apt install -y nginx

echo "Installing Git..."
apt install -y git

echo "Installing Let's Encrypt Certbot..."
apt install -y certbot python3-certbot-nginx

echo "Creating deploy user..."
useradd -m -s /bin/bash deploy || true

echo "System setup complete!"
EOF

echo -e "${GREEN}✅ System dependencies installed${NC}"

echo -e "\n${YELLOW}Step 3: Setting up application directory...${NC}"

ssh_cmd 'bash -s' << EOF
set -e
APP_DIR="/home/deploy/shaadi-bazaar"

# Create app directory
mkdir -p \$APP_DIR
cd \$APP_DIR

# Initialize git repo
git init --initial-branch=main
git config user.email "deploy@shaadibazaar.pk"
git config user.name "Deploy Bot"

# Create .env file
cat > .env.production << 'ENVFILE'
NODE_ENV=production
PORT=3000
MONGODB_URI=$MONGODB_URI
JWT_SECRET=$JWT_SECRET
NEXT_PUBLIC_API_URL=https://$DOMAIN_NAME
ENVFILE

# Create ecosystem.config.js
cat > ecosystem.config.js << 'PMFILE'
module.exports = {
  apps: [{
    name: 'shaadi-bazaar',
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
PMFILE

# Create logs directory
mkdir -p logs

# Set proper permissions
chown -R deploy:deploy \$APP_DIR
chmod 755 \$APP_DIR

echo "Application directory created!"
EOF

echo -e "${GREEN}✅ Application directory setup complete${NC}"

echo -e "\n${YELLOW}Step 4: Building and deploying application...${NC}"

# Build locally
npm run build

# Create tarball of built app
tar -czf shaadi-bazaar.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next \
  .

# Copy to VPS
scp_cmd shaadi-bazaar.tar.gz "$VPS_USER@$VPS_IP:/home/deploy/shaadi-bazaar/"

# Extract and setup on VPS
ssh_cmd 'bash -s' << 'EOF'
set -e
cd /home/deploy/shaadi-bazaar

echo "Extracting application..."
tar -xzf shaadi-bazaar.tar.gz

echo "Installing dependencies..."
npm install --production

echo "Building application..."
npm run build

echo "Setup PM2..."
pm2 start ecosystem.config.js
pm2 startup
pm2 save

echo "Application deployed!"
EOF

echo -e "${GREEN}✅ Application deployed${NC}"

echo -e "\n${YELLOW}Step 5: Configuring Nginx...${NC}"

ssh_cmd 'bash -s' << EOF
set -e

# Backup original Nginx config
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.bak

# Create new Nginx config
cat > /etc/nginx/sites-available/shaadi-bazaar << 'NGINXFILE'
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    gzip_vary on;
}
NGINXFILE

# Enable site
rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/shaadi-bazaar /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx

echo "Nginx configured!"
EOF

echo -e "${GREEN}✅ Nginx configured${NC}"

echo -e "\n${YELLOW}Step 6: Setting up SSL Certificate...${NC}"

ssh_cmd "certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME"

echo -e "${GREEN}✅ SSL certificate installed${NC}"

echo -e "\n${YELLOW}Step 7: Setting up auto-renewal...${NC}"

ssh_cmd 'bash -s' << 'EOF'
# Setup certbot auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer

echo "Auto-renewal enabled!"
EOF

echo -e "${GREEN}✅ Auto-renewal configured${NC}"

echo -e "\n${YELLOW}Step 8: Setting up firewall...${NC}"

ssh_cmd 'bash -s' << 'EOF'
set -e

# Enable UFW
ufw --force enable

# Allow SSH (critical!)
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Deny everything else by default (already default)

echo "Firewall configured!"
EOF

echo -e "${GREEN}✅ Firewall configured${NC}"

echo -e "\n${YELLOW}Step 9: Setting up monitoring...${NC}"

ssh_cmd 'bash -s' << 'EOF'
set -e

# Install monitoring tools
apt install -y htop nethogs

# Setup log rotation
cat > /etc/logrotate.d/shaadi-bazaar << 'LOGFILE'
/home/deploy/shaadi-bazaar/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
}
LOGFILE

echo "Monitoring setup complete!"
EOF

echo -e "${GREEN}✅ Monitoring configured${NC}"

# Cleanup
rm -f shaadi-bazaar.tar.gz

echo -e "\n${GREEN}🎉 Deployment complete!${NC}"
echo -e "\nYour app is now live at:"
echo -e "${GREEN}https://$DOMAIN_NAME${NC}"

echo -e "\n${YELLOW}Important commands for VPS management:${NC}"
echo "SSH: ssh deploy@$VPS_IP"
echo "View logs: pm2 logs shaadi-bazaar"
echo "Restart app: pm2 restart shaadi-bazaar"
echo "Reload Nginx: systemctl reload nginx"
echo "Check SSL: certbot certificates"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Update DNS records to point to $VPS_IP"
echo "2. Wait for DNS propagation (24-48 hours)"
echo "3. Monitor application logs: pm2 logs shaadi-bazaar"
echo "4. Setup regular backups"
echo "5. Monitor disk space and memory usage"

echo -e "\nFor detailed documentation, see DEPLOYMENT.md"
