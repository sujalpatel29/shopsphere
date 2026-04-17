import os
from contextlib import closing
from datetime import date, datetime

import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
    )


def _iso_date(value):
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    return str(value)


def fetch_monthly_sales(product_id: int) -> list[dict]:
    query = """
        SELECT
            DATE(DATE_SUB(om.created_at, INTERVAL DAY(om.created_at) - 1 DAY)) AS month,
            ROUND(SUM(oi.quantity), 2) AS qty,
            ROUND(SUM(oi.total), 2)    AS revenue
        FROM order_items oi
        INNER JOIN order_master om ON om.order_id = oi.order_id
        WHERE oi.product_id = %s
          AND oi.is_deleted = 0
          AND om.is_deleted = 0
          AND om.order_status IN ('completed', 'delivered')
        GROUP BY DATE(DATE_SUB(om.created_at, INTERVAL DAY(om.created_at) - 1 DAY))
        ORDER BY month ASC
    """

    with closing(get_connection()) as connection, closing(
        connection.cursor(dictionary=True)
    ) as cursor:
        cursor.execute(query, (product_id,))
        rows = cursor.fetchall()

    return [
        {
            "month":   _iso_date(row["month"]),
            "qty":     float(row["qty"] or 0),
            "revenue": float(row["revenue"] or 0),
        }
        for row in rows
    ]

def fetch_all_active_product_ids() -> list[int]:
    query = """
        SELECT product_id
        FROM product_master
        WHERE is_deleted = 0
        ORDER BY product_id ASC
    """

    with closing(get_connection()) as connection, closing(connection.cursor()) as cursor:
        cursor.execute(query)
        return [int(row[0]) for row in cursor.fetchall()]


def fetch_product_price(product_id: int) -> float:
    query = """
        SELECT COALESCE(discounted_price, price) AS effective_price
        FROM product_master
        WHERE product_id = %s
          AND is_deleted = 0
        LIMIT 1
    """

    with closing(get_connection()) as connection, closing(connection.cursor()) as cursor:
        cursor.execute(query, (product_id,))
        row = cursor.fetchone()

    return float(row[0]) if row and row[0] is not None else 0.0


def product_exists(product_id: int) -> bool:
    query = """
        SELECT 1
        FROM product_master
        WHERE product_id = %s
          AND is_deleted = 0
        LIMIT 1
    """

    with closing(get_connection()) as connection, closing(connection.cursor()) as cursor:
        cursor.execute(query, (product_id,))
        return cursor.fetchone() is not None
