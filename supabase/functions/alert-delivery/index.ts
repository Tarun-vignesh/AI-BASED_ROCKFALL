import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { alertId, mineSiteId, severity, message } = await req.json();
    
    console.log(`Processing alert delivery for alert: ${alertId}, severity: ${severity}`);

    // Get mine site details
    const { data: mineSite } = await supabase
      .from('mine_sites')
      .select('name, location')
      .eq('id', mineSiteId)
      .single();

    // Get users who should receive alerts for this mine site
    const { data: recipients } = await supabase
      .from('profiles')
      .select('id, email, phone_number, full_name, notification_preferences')
      .or(`mine_site_id.eq.${mineSiteId},role.eq.admin`)
      .not('email', 'is', null);

    if (!recipients || recipients.length === 0) {
      console.log('No recipients found for alert');
      return new Response(JSON.stringify({ success: true, message: 'No recipients found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const deliveryPromises: Promise<any>[] = [];

    for (const recipient of recipients) {
      const preferences = recipient.notification_preferences || { 
        email: true, 
        sms: true, 
        dashboard: true 
      };

      // Dashboard notification (always enabled)
      const dashboardDelivery = supabase
        .from('alert_deliveries')
        .insert({
          alert_id: alertId,
          delivery_method: 'dashboard',
          recipient_id: recipient.id,
          recipient_contact: recipient.email,
          status: 'delivered',
          sent_at: new Date().toISOString(),
          delivered_at: new Date().toISOString()
        });
      deliveryPromises.push(dashboardDelivery);

      // Email notification
      if (preferences.email && recipient.email) {
        const emailPromise = sendEmailAlert(recipient, mineSite, severity, message, alertId);
        deliveryPromises.push(emailPromise);
      }

      // SMS notification (simulated - would integrate with SMS provider)
      if (preferences.sms && recipient.phone_number) {
        const smsPromise = sendSMSAlert(recipient, mineSite, severity, message, alertId);
        deliveryPromises.push(smsPromise);
      }
    }

    await Promise.allSettled(deliveryPromises);

    console.log(`Alert delivery completed for ${recipients.length} recipients`);

    return new Response(JSON.stringify({
      success: true,
      recipientCount: recipients.length,
      deliveriesProcessed: deliveryPromises.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in alert delivery:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Alert delivery failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendEmailAlert(recipient: any, mineSite: any, severity: string, message: string, alertId: string) {
  try {
    const priorityIcon = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : '🔶';
    const urgencyText = severity === 'critical' ? 'CRITICAL ALERT' : severity === 'high' ? 'HIGH PRIORITY' : 'ALERT';
    
    const emailResponse = await resend.emails.send({
      from: "Mining Safety System <safety@minesafety.ai>",
      to: [recipient.email],
      subject: `${priorityIcon} ${urgencyText}: Rockfall Risk - ${mineSite?.name || 'Mining Site'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px; color: white; text-align: center;">
            <h1>${priorityIcon} Mining Safety Alert</h1>
            <h2>${urgencyText}</h2>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h3>Alert Details</h3>
            <p><strong>Mine Site:</strong> ${mineSite?.name || 'Unknown'}</p>
            <p><strong>Severity:</strong> <span style="color: ${severity === 'critical' ? '#dc2626' : '#ea580c'}; font-weight: bold;">${severity.toUpperCase()}</span></p>
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #f97316; margin: 15px 0;">
              <h4>Risk Assessment</h4>
              <p>${message}</p>
            </div>

            <div style="background: #fef7ff; padding: 15px; border: 1px solid #d1d5db; border-radius: 8px; margin: 15px 0;">
              <h4>🇮🇳 Indian Mining Conditions Considered</h4>
              <ul>
                <li>Monsoon season impact assessment</li>
                <li>Tropical climate factors</li>
                <li>Regional geological conditions</li>
                <li>Local weather patterns</li>
              </ul>
            </div>

            <div style="background: #fef2f2; padding: 15px; border: 1px solid #fca5a5; border-radius: 8px; margin: 15px 0;">
              <h4>⚠️ Immediate Actions Required</h4>
              <ul>
                <li>Evacuate personnel from affected areas immediately</li>
                <li>Implement safety protocols for Indian mining standards</li>
                <li>Monitor weather conditions closely</li>
                <li>Contact mine safety officer</li>
              </ul>
            </div>

            <p style="text-align: center; margin: 20px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')}?alert=${alertId}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View Full Dashboard
              </a>
            </p>
          </div>

          <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>AI-Powered Mining Safety System for Indian Conditions</p>
            <p>This is an automated safety alert. Do not reply to this email.</p>
          </div>
        </div>
      `,
    });

    await supabase
      .from('alert_deliveries')
      .insert({
        alert_id: alertId,
        delivery_method: 'email',
        recipient_id: recipient.id,
        recipient_contact: recipient.email,
        status: emailResponse.error ? 'failed' : 'sent',
        sent_at: new Date().toISOString(),
        error_message: emailResponse.error?.message
      });

    console.log(`Email sent to ${recipient.email}`);
    return emailResponse;

  } catch (error) {
    console.error(`Email delivery failed for ${recipient.email}:`, error);
    await supabase
      .from('alert_deliveries')
      .insert({
        alert_id: alertId,
        delivery_method: 'email',
        recipient_id: recipient.id,
        recipient_contact: recipient.email,
        status: 'failed',
        sent_at: new Date().toISOString(),
        error_message: error.message
      });
  }
}

async function sendSMSAlert(recipient: any, mineSite: any, severity: string, message: string, alertId: string) {
  try {
    const smsMessage = `🚨 MINING ALERT ${severity.toUpperCase()}: ${mineSite?.name || 'Mining Site'} - ${message.substring(0, 100)}... Check dashboard immediately. Time: ${new Date().toLocaleString('en-IN')} IST`;
    
    // Send real SMS using Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams({
      From: twilioPhoneNumber,
      To: recipient.phone_number,
      Body: smsMessage
    });

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Twilio API error: ${result.message || 'Unknown error'}`);
    }

    console.log(`SMS sent successfully to ${recipient.phone_number}:`, result.sid);
    
    await supabase
      .from('alert_deliveries')
      .insert({
        alert_id: alertId,
        delivery_method: 'sms',
        recipient_id: recipient.id,
        recipient_contact: recipient.phone_number,
        status: 'sent',
        sent_at: new Date().toISOString(),
        delivered_at: new Date().toISOString()
      });

    return { success: true, message: 'SMS sent successfully', sid: result.sid };

  } catch (error) {
    console.error(`SMS delivery failed for ${recipient.phone_number}:`, error);
    await supabase
      .from('alert_deliveries')
      .insert({
        alert_id: alertId,
        delivery_method: 'sms',
        recipient_id: recipient.id,
        recipient_contact: recipient.phone_number,
        status: 'failed',
        sent_at: new Date().toISOString(),
        error_message: error.message
      });
    
    throw error;
  }
}