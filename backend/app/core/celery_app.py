from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "skipd_commerce_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.order_tasks", "app.tasks.email_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    redis_protocol=2,
    broker_transport_options={"protocol": 2},
    result_backend_transport_options={"protocol": 2}
)
