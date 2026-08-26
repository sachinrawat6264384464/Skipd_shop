import asyncio
from app.core.database import AsyncSessionLocal
from app.models.models import User, Review, Product, UserRole
from app.core.security import get_password_hash
from sqlalchemy import select

async def seed_crm_db():
    async with AsyncSessionLocal() as session:
        print("Seeding Real Customer Accounts & Product Reviews into Neon PostgreSQL Database...")

        # 1. Real Users Data
        real_users = [
          {"name": "Sachin Rawat", "email": "sachin.rawat@e-com.in", "phone": "+91 62643 84464", "role": UserRole.CUSTOMER},
          {"name": "Priya Patel", "email": "priya.patel@gmail.com", "phone": "+91 98123 45678", "role": UserRole.CUSTOMER},
          {"name": "Rahul Sharma", "email": "rahul.sharma@yahoo.com", "phone": "+91 98765 43210", "role": UserRole.CUSTOMER},
          {"name": "Sneha Gupta", "email": "sneha.gupta@outlook.com", "phone": "+91 96555 44332", "role": UserRole.CUSTOMER},
          {"name": "Amit Verma", "email": "amit.verma@techmail.com", "phone": "+91 97111 22334", "role": UserRole.CUSTOMER},
          {"name": "Vikram Joshi", "email": "vikram.joshi@gmail.com", "phone": "+91 98222 33445", "role": UserRole.CUSTOMER},
          {"name": "Ananya Roy", "email": "ananya.roy@gmail.com", "phone": "+91 99333 44556", "role": UserRole.CUSTOMER}
        ]

        pwd = get_password_hash("SkipdUser123!")

        created_users = []
        for u_data in real_users:
            res = await session.execute(select(User).where(User.email == u_data["email"]))
            existing = res.scalars().first()
            if not existing:
                u = User(
                    full_name=u_data["name"],
                    email=u_data["email"],
                    phone=u_data["phone"],
                    hashed_password=pwd,
                    role=u_data["role"],
                    is_active=True
                )
                session.add(u)
                await session.flush()
                created_users.append(u)
            else:
                created_users.append(existing)

        # 2. Get Products
        prod_res = await session.execute(select(Product))
        products = prod_res.scalars().all()

        if products:
            real_reviews = [
                {
                    "user": created_users[0],
                    "product": products[0],
                    "rating": 5,
                    "comment": "Outstanding flagship performance! Fast charging and beautiful AMOLED display."
                },
                {
                    "user": created_users[1],
                    "product": products[min(1, len(products)-1)],
                    "rating": 4,
                    "comment": "Deep bass and comfortable earcup cushions for long work hours."
                },
                {
                    "user": created_users[2],
                    "product": products[min(2, len(products)-1)],
                    "rating": 5,
                    "comment": "100% authentic original product. Fast delivery by E-COM team!"
                },
                {
                    "user": created_users[3],
                    "product": products[min(3, len(products)-1)],
                    "rating": 5,
                    "comment": "Love the premium build quality and smooth touchscreen response."
                },
                {
                    "user": created_users[4],
                    "product": products[min(4, len(products)-1)],
                    "rating": 4,
                    "comment": "Great value for money. Very satisfied with purchase."
                }
            ]

            for r_data in real_reviews:
                res = await session.execute(
                    select(Review).where(
                        (Review.user_id == r_data["user"].id) & 
                        (Review.product_id == r_data["product"].id)
                    )
                )
                if not res.scalars().first():
                    rev = Review(
                        product_id=r_data["product"].id,
                        user_id=r_data["user"].id,
                        user_name=r_data["user"].full_name,
                        rating=r_data["rating"],
                        comment=r_data["comment"]
                    )
                    session.add(rev)

        await session.commit()
        print("Successfully seeded Real Customer Accounts & Product Reviews into PostgreSQL Database!")

if __name__ == "__main__":
    asyncio.run(seed_crm_db())
