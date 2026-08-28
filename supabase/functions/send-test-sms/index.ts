import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message } = await req.json();
    
    console.log('Sending SMS to:', phoneNumber);
    console.log('Message:', message);

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    console.log('Using Twilio credentials:', {
      accountSid: accountSid?.substring(0, 10) + '...',
      twilioPhone: twilioPhoneNumber
    });

    // Send SMS using Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams({
      From: twilioPhoneNumber,
      To: phoneNumber,
      Body: message || '🚨 MINING ALERT TEST: System operational. Real-time monitoring active for Indian mining safety compliance. Time: ' + new Date().toLocaleString('en-IN')
    });

    console.log('Sending request to Twilio...');

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();
    
    console.log('Twilio response:', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    if (!response.ok) {
      throw new Error(`Twilio API error (${response.status}): ${result.message || 'Unknown error'}`);
    }

    console.log(`✅ SMS sent successfully! SID: ${result.sid}`);

    return new Response(JSON.stringify({
      success: true,
      sid: result.sid,
      status: result.status,
      to: result.to,
      message: 'SMS sent successfully!'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ SMS sending failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
});