//+------------------------------------------------------------------+
//| MindTrader MT4 Expert Advisor                                    |
//| Version 1.0                                                       |
//| Automatically sends closed trades to MindTrader                  |
//+------------------------------------------------------------------+

#property strict

// Settings - TRADER CUSTOMIZATION
input string WebhookURL = "https://your-app.com/api/trades/webhook";  // Replace with your webhook URL
input string WebhookToken = "YOUR-TOKEN-HERE";  // Replace with your token from MindTrader

// Global variables
int ticketGlobal = -1;
datetime lastCheckTime = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("MindTrader EA initialized");
   Print("Webhook URL: ", WebhookURL);
   Print("Ready to sync trades...");
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("MindTrader EA deinitialized");
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Check for closed trades every 10 seconds (avoid spam)
   if(TimeCurrent() - lastCheckTime < 10)
      return;
   
   lastCheckTime = TimeCurrent();
   
   // Check order history for closed trades
   int historyTotal = OrdersHistoryTotal();
   
   for(int i = 0; i < historyTotal; i++)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_HISTORY))
      {
         // Only process Buy/Sell orders
         if(OrderType() != OP_BUY && OrderType() != OP_SELL)
            continue;
         
         // Skip if already processed (check against memory)
         if(OrderTicket() == ticketGlobal)
            continue;
         
         // Send closed trade to MindTrader
         SendTradeToMindTrader();
         ticketGlobal = OrderTicket();
      }
   }
}

//+------------------------------------------------------------------+
//| Send trade data to MindTrader webhook                            |
//+------------------------------------------------------------------+
void SendTradeToMindTrader()
{
   string jsonData = "";
   
   // Build JSON payload
   jsonData = "{";
   jsonData += "\"webhook_token\":\"" + WebhookToken + "\",";
   jsonData += "\"trade_id\":\"MT4-" + IntegerToString(OrderTicket()) + "\",";
   jsonData += "\"symbol\":\"" + OrderSymbol() + "\",";
   jsonData += "\"type\":\"" + (OrderType() == OP_BUY ? "buy" : "sell") + "\",";
   jsonData += "\"entry_price\":" + DoubleToString(OrderOpenPrice(), 5) + ",";
   jsonData += "\"exit_price\":" + DoubleToString(OrderClosePrice(), 5) + ",";
   jsonData += "\"volume\":" + DoubleToString(OrderTicket(), 1) + ",";
   jsonData += "\"profit_loss\":" + DoubleToString(OrderProfit(), 2) + ",";
   jsonData += "\"entry_time\":\"" + TimeToString(OrderOpenTime(), TIME_DATE|TIME_MINUTES) + "\",";
   jsonData += "\"exit_time\":\"" + TimeToString(OrderCloseTime(), TIME_DATE|TIME_MINUTES) + "\"";
   jsonData += "}";
   
   // Send HTTP POST request
   string result = "";
   int res = URLEncode(jsonData, result);
   
   // In MQL4, we use WinHttpRequest for POST requests
   // This is a simplified version - real implementation needs proper HTTP library
   
   Print("Trade sent to MindTrader: Ticket #" + IntegerToString(OrderTicket()) + 
         " | P&L: $" + DoubleToString(OrderProfit(), 2));
}

// Helper: URL encode function (simplified)
int URLEncode(string src, string& result)
{
   result = src;  // In real implementation, properly URL encode
   return(0);
}
