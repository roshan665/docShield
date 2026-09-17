"""
DocShield - Supabase PostgreSQL Database Synchronizer & Seeder
Connects to Supabase PostgreSQL using DATABASE_URL or project credentials,
executes the full DDL schema, and seeds all demo data with unbroken custody chains.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.core.database import create_application_engine, Base
from sqlalchemy import text


async def main():
    print("=" * 65)
    print("  DOCSHIELD SUPABASE DATABASE SYNCHRONIZER")
    print("=" * 65)
    db_uri = settings.SQLALCHEMY_DATABASE_URI
    print(f"[*] Target Database URI: {db_uri.split('@')[-1] if '@' in db_uri else db_uri}")

    if "sqlite" in db_uri:
        print("[!] Warning: DATABASE_URL is not currently pointing to Supabase PostgreSQL.")
        print("[!] To use Supabase PostgreSQL, set DATABASE_URL in backend/.env:")
        print("    DATABASE_URL=postgresql+asyncpg://postgres.iwinomhcofhouapfirjo:<PASSWORD>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?ssl=require")
        return

    print("[*] Connecting to Supabase PostgreSQL...")
    engine = create_application_engine()

    try:
        async with engine.begin() as conn:
            # Enable extensions
            print("[*] Enabling pgvector and uuid-ossp extensions...")
            try:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector SCHEMA public;"))
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\" SCHEMA public;"))
                print("[+] Extensions enabled successfully")
            except Exception as e:
                print(f"[-] Extension warning: {e}")

            print("[*] Creating all DocShield database tables...")
            await conn.run_sync(Base.metadata.create_all)
            print("[+] All database tables created successfully in Supabase!")

        print("[*] Running demo data seeder against Supabase...")
        from scripts.seed_demo_data import seed_demo_data
        await seed_demo_data()
        print("\n[+] SUCCESS: Supabase PostgreSQL database is fully provisioned and seeded!")

    except Exception as exc:
        print(f"[-] Database connection/migration failed: {exc}")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
