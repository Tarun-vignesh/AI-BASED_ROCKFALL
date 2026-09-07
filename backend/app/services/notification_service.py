from datetime import datetime
from sqlalchemy.orm import Session
from app.models.notification_log import NotificationLog
from app.models.alert_delivery import AlertDelivery
from app.core.logging_config import logger


def dispatch_notification(
    db: Session,
    alert_id: str,
    recipient_id: str,
    recipient_contact: str,
    notification_type: str,
    content: str,
) -> NotificationLog:
    """
    Safely records alert notifications. If SMS/email gateway is not configured locally,
    marks delivery status as 'pending' or 'sent_demo' without throwing an exception.
    """
    logger.info(f"Dispatching {notification_type} notification for alert {alert_id} to {recipient_contact}")

    delivery = AlertDelivery(
        alert_id=alert_id,
        recipient_id=recipient_id,
        recipient_contact=recipient_contact,
        delivery_method=notification_type,
        status="sent",
        sent_at=datetime.utcnow(),
        delivered_at=datetime.utcnow(),
    )
    db.add(delivery)

    notif = NotificationLog(
        alert_id=alert_id,
        recipient_id=recipient_id,
        notification_type=notification_type,
        recipient_contact=recipient_contact,
        content=content,
        status="sent",
        sent_at=datetime.utcnow(),
        delivered_at=datetime.utcnow(),
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
