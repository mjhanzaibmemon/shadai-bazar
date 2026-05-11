import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Listing from '@/models/Listing';

/**
 * JazzCash Payment Callback Handler
 * This endpoint receives payment confirmation from JazzCash
 *
 * Expected callback parameters from JazzCash:
 * - pp_TransactionID: JazzCash transaction ID
 * - pp_TxnRefNo: Our transaction ID (TXN_xxxxx)
 * - pp_ResponseCode: Response code (0 = success)
 * - pp_ResponseDesc: Response description
 * - pp_Amount: Amount charged
 * - pp_BillReference: Our payment record ID
 */

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Parse JazzCash callback
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('pp_TransactionID');
    const txnRefNo = searchParams.get('pp_TxnRefNo'); // Our TXN_xxxxx
    const responseCode = searchParams.get('pp_ResponseCode');
    const responseDesc = searchParams.get('pp_ResponseDesc');
    const amount = searchParams.get('pp_Amount');
    const billRef = searchParams.get('pp_BillReference'); // Payment record ID

    // Validate callback
    if (!transactionId || !txnRefNo || !responseCode) {
      console.error('Invalid JazzCash callback parameters');
      return NextResponse.json(
        { error: 'Invalid callback parameters' },
        { status: 400 }
      );
    }

    // Find payment record
    const payment = await Payment.findById(billRef).populate('listing');
    if (!payment) {
      console.error('Payment record not found:', billRef);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if payment matches
    if (payment.transactionId !== txnRefNo) {
      console.error('Transaction ID mismatch');
      return NextResponse.json(
        { error: 'Transaction ID mismatch' },
        { status: 400 }
      );
    }

    // Check response code
    if (responseCode === '0') {
      // Payment successful
      payment.status = 'completed';
      payment.externalTransactionId = transactionId;
      payment.responseCode = responseCode;
      payment.responseDesc = responseDesc;
      await payment.save();

      // Mark listing as featured
      const listing = await Listing.findById(payment.listing);
      if (listing) {
        listing.isFeatured = true;
        listing.featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await listing.save();
      }

      console.log(`Payment completed: ${txnRefNo} - Amount: ${amount}`);

      // Send success email notification
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: payment.user?.email || 'noreply@shaadibazaar.com',
            type: 'listing_featured',
            data: {
              sellerName: payment.user?.name || 'Seller',
              listingTitle: listing?.title || 'Your Listing',
              listingUrl: `${process.env.NEXT_PUBLIC_API_URL}/listing/${listing?._id}`,
            },
          }),
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the transaction if email fails
      }

      return NextResponse.json(
        {
          message: 'Payment confirmed and listing featured',
          payment,
          listing,
        },
        { status: 200 }
      );
    } else {
      // Payment failed
      payment.status = 'failed';
      payment.responseCode = responseCode;
      payment.responseDesc = responseDesc;
      await payment.save();

      console.log(`Payment failed: ${txnRefNo} - Code: ${responseCode}, Desc: ${responseDesc}`);

      return NextResponse.json(
        {
          message: 'Payment failed',
          payment,
          error: responseDesc,
        },
        { status: 200 } // Return 200 to acknowledge receipt
      );
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Test endpoint to simulate JazzCash callback
 * Usage: POST /api/payments/callback/test
 * Body: {
 *   "pp_TransactionID": "JZ123456789",
 *   "pp_TxnRefNo": "TXN_1702000000000",
 *   "pp_ResponseCode": "0",
 *   "pp_ResponseDesc": "Success",
 *   "pp_Amount": "2500",
 *   "pp_BillReference": "payment_record_id"
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const searchParams = new URLSearchParams();

    Object.entries(body).forEach(([key, value]) => {
      searchParams.set(key, String(value));
    });

    // Call POST with URL parameters
    const testRequest = new NextRequest(
      new URL(`${request.url}?${searchParams.toString()}`),
      { method: 'POST' }
    );

    return POST(testRequest);
  } catch (error) {
    console.error('Test callback error:', error);
    return NextResponse.json(
      { error: 'Test callback failed' },
      { status: 500 }
    );
  }
}
