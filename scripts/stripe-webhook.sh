#!/bin/bash
# Stripe Webhook Listener Management Script

case "$1" in
  start)
    echo "Starting Stripe webhook listener..."
    if pgrep -f "stripe listen" > /dev/null; then
      echo "Stripe webhook listener is already running!"
      ps aux | grep "stripe listen" | grep -v grep
    else
      stripe listen --forward-to localhost:4000/api/webhooks/stripe > /tmp/stripe-webhook.log 2>&1 &
      sleep 2
      echo "Stripe webhook listener started!"
      echo "Webhook secret: $(grep "webhook signing secret" /tmp/stripe-webhook.log | sed 's/.*secret is //' | sed 's/ .*//')"
      echo "Log file: /tmp/stripe-webhook.log"
    fi
    ;;

  stop)
    echo "Stopping Stripe webhook listener..."
    pkill -f "stripe listen"
    echo "Stripe webhook listener stopped!"
    ;;

  restart)
    $0 stop
    sleep 1
    $0 start
    ;;

  status)
    if pgrep -f "stripe listen" > /dev/null; then
      echo "Stripe webhook listener is RUNNING"
      ps aux | grep "stripe listen" | grep -v grep
      echo ""
      echo "Recent logs:"
      tail -n 10 /tmp/stripe-webhook.log
    else
      echo "Stripe webhook listener is NOT running"
    fi
    ;;

  logs)
    if [ -f /tmp/stripe-webhook.log ]; then
      tail -f /tmp/stripe-webhook.log
    else
      echo "No log file found at /tmp/stripe-webhook.log"
    fi
    ;;

  *)
    echo "Stripe Webhook Listener Management"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|logs}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the webhook listener"
    echo "  stop    - Stop the webhook listener"
    echo "  restart - Restart the webhook listener"
    echo "  status  - Check if the listener is running"
    echo "  logs    - Show live logs (Ctrl+C to exit)"
    echo ""
    exit 1
    ;;
esac
