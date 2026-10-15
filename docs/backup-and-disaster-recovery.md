# Database Backup & Disaster Recovery Guide

This guide establishes the backup strategy, Point-in-Time Recovery (PITR), and self-service tenant export procedures for the Digital Menu platform.

---

## 💾 Backup Strategy Architecture

| Tier | Frequency | Retention | Recovery Time Objective (RTO) | Recovery Point Objective (RPO) |
|---|---|---|---|---|
| **Continuous WAL Archiving (PITR)** | Continuous | 7 to 30 Days | < 15 minutes | < 1 minute |
| **Automated Daily Snapshots** | Daily (03:00 UTC) | 30 Days | < 30 minutes | 24 hours |
| **Tenant Self-Service JSON Export** | On-Demand (Owner) | Local storage / Cloud | Immediate | Zero downtime |

---

## 🛠️ Backup Procedures

### 1. Automated Supabase Backups
- Supabase automatically takes daily physical snapshots and writes continuous Write-Ahead Logs (WAL).
- To restore in the event of catastrophic data corruption:
  1. Open **Supabase Dashboard > Project Settings > Backups**.
  2. Select **Point in Time (PITR)**.
  3. Pick the exact timestamp immediately preceding the incident.
  4. Click **Restore to Timestamp**.

### 2. Manual Logical Backups via pg_dump
To take an offsite cold backup prior to major schema migrations:
```bash
# Export full database schema and data
pg_dump -h db.your-project.supabase.co -U postgres -d postgres -F c -b -v -f digital_menu_backup_$(date +%Y%m%d).dump

# Restore dump to a staging or disaster recovery instance
pg_restore -h db.dr-project.supabase.co -U postgres -d postgres -v digital_menu_backup_YYYYMMDD.dump
```

### 3. Tenant Self-Service Export & Emergency Purge
- Restaurant owners can independently export their complete menu, category hierarchy, operational hours, and theme tokens at any time.
- Located in **Admin Console > Settings > Export Restaurant Data (JSON)**.
- Generates a standalone JSON payload that can be re-imported into any new tenant workspace within seconds.
