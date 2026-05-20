# GitHub Actions Workflows

## Overview

This directory contains GitHub Actions workflows to keep various services alive and prevent them from spinning down due to inactivity.

### Workflows

1. **keep-render-alive.yml** - Keeps Render web services alive (API + Frontend)
2. **keep-database-alive.yml** - Keeps Render PostgreSQL database alive
3. **keep-supabase-alive.yml** - Keeps Supabase alive (optional, for future use)

---

## 1. Keep Render Services Alive

**File**: `keep-render-alive.yml`

### Purpose
Prevents Render free-tier web services (Laravel API and React Frontend) from spinning down due to inactivity.

### Schedule
- Runs every 10 minutes during active hours (6 AM - 11 PM UTC)
- Services spin down after 15 minutes of inactivity on free tier

### Setup
Add these GitHub secrets:
- `RENDER_API_URL` - Your Laravel API URL (e.g., `https://blinked-api.onrender.com`)
- `RENDER_FRONTEND_URL` - Your React app URL (e.g., `https://blinked.onrender.com`)

---

## 2. Keep Database Alive

**File**: `keep-database-alive.yml`

### Purpose
Keeps Render PostgreSQL database from pausing by triggering database connections through the API health check endpoint.

### Schedule
- Runs every 12 hours
- Render free-tier databases can pause after extended inactivity

### Setup
Uses the same `RENDER_API_URL` secret as the Render workflow.

---

## 3. Keep Supabase Alive (Optional)

**File**: `keep-supabase-alive.yml`

### Purpose
Prevents Supabase free-tier projects from pausing after 7 days of inactivity.

**Note**: This workflow is optional and only needed if you're using Supabase. Currently, this project uses Render PostgreSQL, not Supabase.

### Schedule
- Runs every 5 days
- Supabase pauses after 7 days of inactivity on free tier

### Setup (if using Supabase)
Add these GitHub secrets:
- `SUPABASE_URL` - Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

To disable this workflow if not using Supabase:
1. Go to Actions tab in GitHub
2. Click on "Keep Supabase Alive"
3. Click the "..." menu → "Disable workflow"

---

## Setup Instructions

### 1. Add GitHub Secrets
### 1. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

#### Required Secrets (for Render):

**RENDER_API_URL**
- Name: `RENDER_API_URL`
- Value: `https://your-laravel-api.onrender.com`
- Example: `https://blinked-api.onrender.com`
- Used by: `keep-render-alive.yml`, `keep-database-alive.yml`

**RENDER_FRONTEND_URL**
- Name: `RENDER_FRONTEND_URL`
- Value: `https://your-react-app.onrender.com`
- Example: `https://blinked.onrender.com`
- Used by: `keep-render-alive.yml`

#### Optional Secrets (only if using Supabase):

**SUPABASE_URL**
- Name: `SUPABASE_URL`
- Value: `https://xxxxx.supabase.co`
- Used by: `keep-supabase-alive.yml`

**SUPABASE_ANON_KEY**
- Name: `SUPABASE_ANON_KEY`
- Value: Your Supabase anonymous key (from Supabase dashboard)
- Used by: `keep-supabase-alive.yml`

### 2. Enable GitHub Actions
1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. If prompted, click "I understand my workflows, go ahead and enable them"

### 3. Verify Workflows Are Working

1. Go to Actions tab in GitHub
2. You should see three workflows:
   - "Keep Render Services Alive" (runs every 10 minutes)
   - "Keep Render Database Alive" (runs every 12 hours)
   - "Keep Supabase Alive" (runs every 5 days - optional)
3. Click "Run workflow" on each to test manually
4. Check the logs to verify pings are successful

### 4. Disable Unused Workflows (Optional)

If you're not using Supabase:
1. Go to Actions tab
2. Click on "Keep Supabase Alive"
3. Click "..." menu → "Disable workflow"

---

## Expected Results

### Render Services (keep-render-alive.yml)
- **Before**: Services spin down after 15 minutes → 30-60 second cold starts
- **After**: Services stay warm during active hours → <2 second response times
- **Benefit**: 90% reduction in cold starts

### Database (keep-database-alive.yml)
- **Before**: Database may pause after extended inactivity
- **After**: Database stays active with regular health checks
- **Benefit**: Consistent database availability

### Supabase (keep-supabase-alive.yml) - Optional
- **Before**: Supabase pauses after 7 days of inactivity
- **After**: Supabase stays active with pings every 5 days
- **Benefit**: No unexpected pauses

---

## Workflow Details

### Keep Render Services Alive

**Schedule**: `*/10 6-23 * * *` (every 10 minutes, 6 AM - 11 PM UTC)

**What it does**:
1. Pings Laravel API at `/api/ping`
2. Pings React Frontend homepage
3. Logs response codes
4. Continues even if one fails

**Why this schedule**:
- Covers active hours when users are likely to access the app
- Lets services sleep during off-hours (11 PM - 6 AM) to save resources
- 10-minute interval ensures services never reach the 15-minute timeout

### Keep Database Alive

**Schedule**: `0 */12 * * *` (every 12 hours)

**What it does**:
1. Pings `/api/health` endpoint
2. Health endpoint checks database connectivity
3. Keeps database connection active

**Why this schedule**:
- Database doesn't need as frequent pings as web services
- 12-hour interval is sufficient to prevent pausing
- Uses less GitHub Actions minutes

### Keep Supabase Alive

**Schedule**: `0 12 */5 * *` (every 5 days at noon UTC)

**What it does**:
1. Pings Supabase REST API
2. Uses anonymous key for authentication
3. Prevents 7-day inactivity pause

**Why this schedule**:
- Supabase pauses after 7 days, so 5-day interval provides buffer
- Less frequent = fewer GitHub Actions minutes used
- Only runs if you're using Supabase

---

## Customization

### Change Ping Frequency

Edit the cron expression in the workflow file:

```yaml
# Every 5 minutes (more aggressive)
- cron: '*/5 * * * *'

# Every 15 minutes (less aggressive)
- cron: '*/15 * * * *'

# Only during business hours (9 AM - 5 PM UTC, weekdays)
- cron: '*/10 9-17 * * 1-5'

# 24/7 coverage
- cron: '*/10 * * * *'
```

### Add More Endpoints

Add additional steps to any workflow:

```yaml
- name: Ping Additional Service
  run: |
    curl -s "${{ secrets.ANOTHER_SERVICE_URL }}/health"
```

---

## Troubleshooting

### Workflows Not Running

**Check**:
- GitHub Actions is enabled (Settings → Actions → Allow all actions)
- Workflow files are in `.github/workflows/` directory
- YAML syntax is valid (use GitHub's workflow editor)
- Secrets are configured correctly

**Fix**:
- Go to Actions tab → Select workflow → "Enable workflow"
- Check for syntax errors in workflow file
- Verify secrets are set (Settings → Secrets and variables → Actions)

### Pings Failing

**Check**:
- URLs in secrets are correct (no trailing slashes)
- Services are actually running on Render
- `/api/ping` and `/api/health` endpoints exist
- Network connectivity from GitHub Actions

**Fix**:
- Test endpoints manually: `curl https://your-api.onrender.com/api/ping`
- Check Render dashboard for service status
- Review workflow logs for specific error messages
- Verify secrets don't have typos

### Services Still Cold Starting

**Check**:
- Workflows are running successfully (green checkmarks in Actions tab)
- Schedule covers your active hours
- Render dashboard shows recent activity

**Fix**:
- Increase ping frequency (e.g., every 5 minutes)
- Extend active hours (e.g., 24/7 coverage)
- Add UptimeRobot as backup monitoring
- Consider upgrading to Render paid tier

### GitHub Actions Minutes Limit

**Free Tier**: 2,000 minutes/month for private repos, unlimited for public repos

**Current Usage**:
- Render services: ~1 minute per day (144 pings × 0.4 seconds each)
- Database: ~0.1 minutes per day (2 pings × 3 seconds each)
- Supabase: ~0.01 minutes per day (0.2 pings × 3 seconds each)
- **Total**: ~1.1 minutes per day = ~33 minutes per month

**Well within free tier limits!**

---

## Cost Considerations

### GitHub Actions
- **Free Tier**: 2,000 minutes/month (private repos)
- **Public Repos**: Unlimited
- **This Setup**: ~33 minutes/month
- **Cost**: $0 (well within free tier)

### Render Free Tier
- **Web Services**: 750 hours/month free
- **Database**: Free PostgreSQL with limitations
- **Keep-Alive**: Maximizes usage of free hours
- **Cost**: $0 (free tier)

### Paid Tier Alternative
- **Render Starter**: $7/month per service (no cold starts)
- **Benefits**: Always-on, better performance, no keep-alive needed
- **Recommended for**: Production use

---

## Best Practices

### Recommended Setup

1. ✅ **Use all three workflows** (if applicable):
   - Render services (every 10 minutes during active hours)
   - Database (every 12 hours)
   - Supabase (every 5 days, if using)

2. ✅ **Add UptimeRobot** as backup:
   - More reliable than GitHub Actions alone
   - Email alerts if services go down
   - Free tier: 50 monitors, 5-minute intervals
   - Sign up: https://uptimerobot.com

3. ✅ **Monitor performance**:
   - Check Actions tab regularly for failures
   - Review Render dashboard for service health
   - Set up alerts for critical issues

4. ✅ **Optimize schedules**:
   - Active hours only for web services (save resources)
   - Less frequent for database (sufficient to prevent pausing)
   - Minimal for Supabase (7-day buffer)

### For Production

**Consider upgrading to paid tier**:
- No cold starts (instant response)
- Better performance and reliability
- No need for keep-alive workflows
- Professional appearance
- Cost: $14/month (web + database)

---

## Alternative: UptimeRobot

For even better reliability, use UptimeRobot in addition to GitHub Actions:

### Setup
1. Sign up at https://uptimerobot.com (free)
2. Create HTTP(s) monitor
3. URL: `https://your-api.onrender.com/api/ping`
4. Interval: 5 minutes
5. Timeout: 30 seconds

### Benefits
- More reliable than GitHub Actions
- Email/SMS alerts if service goes down
- Better uptime monitoring dashboard
- Runs 24/7 without gaps
- Free tier: 50 monitors

### Recommended Combination
- **GitHub Actions**: Daytime keep-alive (6 AM - 11 PM)
- **UptimeRobot**: 24/7 monitoring + alerts
- **Result**: Best uptime with minimal cost

---

## Support

### Resources
- [Render Documentation](https://render.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase Documentation](https://supabase.com/docs)
- [UptimeRobot](https://uptimerobot.com)

### Troubleshooting
- Check workflow logs in Actions tab
- Review Render service logs
- Test endpoints manually with curl
- Verify secrets are configured correctly

### Questions?
- Review this README
- Check workflow comments
- Test manually with "Run workflow" button
- Monitor Actions tab for issues
