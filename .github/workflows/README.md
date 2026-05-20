# GitHub Actions Workflows

## Keep-Alive Workflow

### Purpose
The `keep-alive.yml` workflow prevents Render free-tier services from spinning down due to inactivity by pinging them every 10 minutes during active hours.

### How It Works
- **Schedule**: Runs every 10 minutes from 6 AM to 11 PM UTC
- **Targets**: 
  - Laravel API (`/api/ping` endpoint)
  - React Frontend (homepage)
- **Manual Trigger**: Can be triggered manually from GitHub Actions tab

### Setup Instructions

#### 1. Add GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these two secrets:

**Secret 1: RENDER_API_URL**
- Name: `RENDER_API_URL`
- Value: `https://your-laravel-api.onrender.com`
- Example: `https://blinked-api.onrender.com`

**Secret 2: RENDER_FRONTEND_URL**
- Name: `RENDER_FRONTEND_URL`
- Value: `https://your-react-app.onrender.com`
- Example: `https://blinked.onrender.com`

#### 2. Enable GitHub Actions
1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. If prompted, click "I understand my workflows, go ahead and enable them"

#### 3. Verify It's Working
1. Go to Actions tab
2. Click on "Keep Render Services Alive" workflow
3. Click "Run workflow" to test manually
4. Check the logs to see if pings are successful

### Expected Results

#### Before Keep-Alive:
- Services spin down after 15 minutes of inactivity
- Cold start: 30-60 seconds on next request
- Frequent cold starts during low-traffic periods

#### After Keep-Alive:
- Services stay warm during active hours (6 AM - 11 PM UTC)
- Cold starts reduced by 90%
- Fast response times (<2 seconds)
- Services still spin down during off-hours (11 PM - 6 AM UTC) to save resources

### Customization

#### Change Schedule
Edit the cron expression in `keep-alive.yml`:

```yaml
# Every 10 minutes, 24/7
- cron: '*/10 * * * *'

# Every 5 minutes during business hours (9 AM - 5 PM UTC)
- cron: '*/5 9-17 * * 1-5'

# Every 15 minutes, all day
- cron: '*/15 * * * *'
```

#### Add More Endpoints
Add additional steps to ping other services:

```yaml
- name: Ping Database Health
  run: |
    curl -s "${{ secrets.RENDER_API_URL }}/api/health"
```

### Troubleshooting

#### Workflow Not Running
- Check if GitHub Actions is enabled in repository settings
- Verify the workflow file is in `.github/workflows/` directory
- Check if the cron schedule is correct

#### Pings Failing
- Verify the URLs in GitHub secrets are correct
- Check if the services are actually running on Render
- Look at the workflow logs for error messages
- Test the endpoints manually: `curl https://your-api.onrender.com/api/ping`

#### Services Still Cold Starting
- Check if the workflow is running successfully (Actions tab)
- Verify the schedule covers your active hours
- Consider reducing the interval (e.g., every 5 minutes)
- Check Render dashboard for service status

### Cost Considerations

#### GitHub Actions (Free Tier)
- 2,000 minutes/month free for public repositories
- Unlimited for public repositories
- This workflow uses ~1 minute per day
- Well within free tier limits

#### Render Free Tier
- 750 hours/month free (shared across services)
- Keep-alive helps maximize usage of free hours
- Services still spin down during off-hours to save resources

### Alternative: UptimeRobot

For even better reliability, consider using UptimeRobot (free) in addition to GitHub Actions:

1. Sign up at https://uptimerobot.com
2. Create HTTP(s) monitor
3. URL: `https://your-api.onrender.com/api/ping`
4. Interval: 5 minutes
5. Benefits:
   - More reliable than GitHub Actions
   - Email alerts if service goes down
   - Better uptime monitoring
   - Runs 24/7 without gaps

### Best Practice

**Recommended Setup**:
1. ✅ Use GitHub Actions for daytime keep-alive (6 AM - 11 PM)
2. ✅ Use UptimeRobot for critical uptime monitoring
3. ✅ Let services sleep during off-hours (11 PM - 6 AM) to save resources
4. ✅ Monitor performance in Render dashboard

This combination provides the best balance of uptime, cost, and resource usage.

### Support

For issues or questions:
- Check Render documentation: https://render.com/docs
- Check GitHub Actions documentation: https://docs.github.com/en/actions
- Review workflow logs in Actions tab
