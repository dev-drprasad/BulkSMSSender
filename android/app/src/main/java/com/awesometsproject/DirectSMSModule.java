package com.bulksmssender;
 
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.facebook.react.bridge.Callback;
import android.telephony.SmsManager;
import android.telephony.SubscriptionManager;
import android.telephony.SubscriptionInfo;
import java.util.List;
import android.util.Log;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.BroadcastReceiver;
import android.content.IntentFilter;
import android.app.Activity;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import android.content.Context;
import 	java.util.ArrayList;

public class DirectSMSModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
private Callback callback = null;
private int msgParts = 0;
private boolean anyError = false;

  BroadcastReceiver deliverSMS = new BroadcastReceiver() {
        @Override
        public void onReceive(Context arg0, Intent arg1) {
            switch (getResultCode()) {
                case Activity.RESULT_OK:
                    // callback.invoke(DELIVERED);
                    break;
                case Activity.RESULT_CANCELED:
                    break;
            }
        }
    };

    public DirectSMSModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native
        this.reactContext = reactContext;

    }
 
    @Override
    public String getName() {
        return "DirectSMS";
    }
 
    private static String SENT = "SMS_SENT", DELIVERED = "SMS_DELIVERED";

    
    @ReactMethod
    public void send(String numbers, String msg, final Callback callback) {
                    this.callback = callback;


    // PendingIntent sentPI = PendingIntent.getBroadcast(this.reactContext, 0, new Intent(
    //     SENT), 0);

    // PendingIntent deliveredPI = PendingIntent.getBroadcast(this.reactContext, 0,
    //     new Intent(DELIVERED), 0);

  

//     reactContext.registerReceiver(new BroadcastReceiver(){
//     @Override
//     public void onReceive(ReactApplicationContext arg0, Intent arg1) {
//         switch (getResultCode()) {
//                 case Activity.RESULT_OK:
//                     callback.invoke(SENT);
//                     break;
//                 case Activity.RESULT_CANCELED:
//                     break;
//             }
//     }
// }, new IntentFilter(SENT));

    // reactContext.registerReceiver(sendSMS, new IntentFilter(SENT));
    // reactContext.registerReceiver(deliverSMS, new IntentFilter(DELIVERED));

        SubscriptionManager localSubscriptionManager = SubscriptionManager.from(this.reactContext);

        SmsManager smsManager;
        if (localSubscriptionManager.getActiveSubscriptionInfoCount() > 1) {
            List localList = localSubscriptionManager.getActiveSubscriptionInfoList();

            SubscriptionInfo simInfo1 = (SubscriptionInfo) localList.get(0);
            SubscriptionInfo simInfo2 = (SubscriptionInfo) localList.get(1);

            //SendSMS From SIM One
             smsManager = SmsManager.getSmsManagerForSubscriptionId(simInfo1.getSubscriptionId());

        } else {
            smsManager = SmsManager.getDefault();
        }

        ArrayList<String> messages = smsManager.divideMessage(msg);
                        final int numParts = messages.size();


        BroadcastReceiver sentReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context arg0, Intent arg1) {
            switch (getResultCode()) {
                case Activity.RESULT_OK:
                    break;
                case SmsManager.RESULT_ERROR_GENERIC_FAILURE:
                case SmsManager.RESULT_ERROR_NO_SERVICE:
                case SmsManager.RESULT_ERROR_NULL_PDU:
                case SmsManager.RESULT_ERROR_RADIO_OFF:
                anyError = true;
                break;
            }

            msgParts--;
            if (msgParts == 0) {
                if (anyError) {
callback.invoke("ERROR", messages.size());
                } else {
callback.invoke(SENT, messages.size());
                }
                reactContext.unregisterReceiver(this);
            }
        }
    };
    reactContext.registerReceiver(sentReceiver, new IntentFilter(SENT));

ArrayList<PendingIntent> sentIntents = new ArrayList<PendingIntent>();
 for (int i=0; i < messages.size(); i++){

                sentIntents.add(PendingIntent.getBroadcast(this.reactContext, 0, new Intent(SENT), 0));
            }
            msgParts = numParts;
            anyError = false;
            smsManager.sendMultipartTextMessage(numbers, null, messages, sentIntents,null);


        try {    
            // smsManager.sendTextMessage(numbers, null, msg, sentPI, deliveredPI);   
            // Log.d("DirectSMSModule", "message sent");
        } catch (Exception ex) {
            callback.invoke("ERROR", 0);
            System.out.println("couldn't send message.");
        }
    }
}
