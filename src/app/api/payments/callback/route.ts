import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Listing from '@/models/Listing';
import { verifyJazzCashCallback } from '@/lib/jazzcash';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimitMiddleware';

/**
 * JazzCash Payment Callback Handler
 * Receives form-encoded POST from JazzCash gateway after the user completes
 * or fails the transaction. Verifies the integrity hash, updates the Payment
 * record, and on success activates the featured-listing flag for 30 days.
 */

const FEATURED_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

  const limited = enforceRateLimit(request, {
    key: `payment-callback:${getClientIp(request)}`,
    limit: 20,
    windowMs: 60 * 1000,
  });
  if (limited) return NextResponse.redirect(`${baseUrl}/my-listings?payment=failed`);

  try {
    await connectDB();

    // JazzCash posts form-encoded data, not JSON.
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = typeof value === 'string' ? value : '';
    });

    const txnRefNo = params.pp_TxnRefNo;
    const responseCode = params.pp_ResponseCode;

    if (!txnRefNo) {
      console.error('[jazzcash-callback] missing pp_TxnRefNo');
      return NextResponse.redirect(`${baseUrl}/my-listings?payment=failed`);
    }

    // Verify HMAC signature.
    const valid = verifyJazzCashCallback(params);
    if (!valid) {
      console.error('[jazzcash-callback] invalid secure hash', { txnRefNo });
      return NextResponse.redirect(`${baseUrl}/my-listings?payment=failed`);
    }

    const payment = await Payment.findOne({ transactionId: txnRefNo });
    if (!payment) {
      console.error('[jazzcash-callback] payment not found', { txnRefNo });
      return NextResponse.redirect(`${baseUrl}/my-listings?payment=failed`);
    }

    const success = responseCode === '000';

    payment.status = success ? 'completed' : 'failed';
    payment.responseCode = responseCode || null;
    payment.responseDesc = params.pp_ResponseMessage || params.pp_ResponseDesc || null;
    if (params.pp_TransactionID) {
      payment.externalTransactionId = params.pp_TransactionID;
    }
    await payment.save();

    if (success && payment.type === 'featured_listing') {
      const listing = await Listing.findById(payment.listing);
      if (listing) {
        listing.featured = true;
        listing.isFeatured = true;
        listing.featuredUntil = new Date(Date.now() + FEATURED_DURATION_MS);
        await listing.save();
      }
    }

    return NextResponse.redirect(
      `${baseUrl}/my-listings?payment=${success ? 'success' : 'failed'}`
    );
  } catch (error) {
    console.error('[jazzcash-callback] error:', error);
    return NextResponse.redirect(`${baseUrl}/my-listings?payment=failed`);
  }
}
