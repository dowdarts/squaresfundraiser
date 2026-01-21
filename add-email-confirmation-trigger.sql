-- Database trigger to send confirmation emails when admin approves purchases
-- Run this in Supabase SQL Editor after deploying the Edge Function

-- Create a function to call the Edge Function
CREATE OR REPLACE FUNCTION send_confirmation_email_trigger()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  service_role_key TEXT;
  buyer_squares TEXT;
BEGIN
  -- Only send email when changing from pending to sold
  IF (OLD.payment_status = 'pending' AND NEW.sold = TRUE) THEN
    
    -- Get the Supabase function URL (replace with your actual project URL)
    function_url := 'https://osicsfticatmfdoknfem.supabase.co/functions/v1/send-confirmation-email';
    
    -- Get all square numbers for this buyer
    SELECT string_agg(square_number::TEXT, ', ' ORDER BY square_number)
    INTO buyer_squares
    FROM squares
    WHERE buyer_email = NEW.buyer_email 
      AND (sold = TRUE OR payment_status = 'pending');
    
    -- Call the Edge Function to send email (using pg_net extension)
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
        ),
        body := jsonb_build_object(
          'buyerEmail', NEW.buyer_email,
          'buyerName', NEW.buyer_name,
          'squares', buyer_squares,
          'eventName', 'AADS 50 Square Fundraiser'
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_square_approved ON squares;
CREATE TRIGGER on_square_approved
  AFTER UPDATE ON squares
  FOR EACH ROW
  EXECUTE FUNCTION send_confirmation_email_trigger();

-- Note: You need to enable the pg_net extension first:
-- Run this command in SQL Editor if not already enabled:
-- CREATE EXTENSION IF NOT EXISTS pg_net;
