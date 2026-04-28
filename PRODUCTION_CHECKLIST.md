# Production Checklist

## Pre-Deployment

### Backend
- [ ] Update `SECRET_KEY` in `.env` to a strong random value
- [ ] Configure `ANTHROPIC_API_KEY` with valid credentials
- [ ] Set up production database (not kin.db in temp folder)
- [ ] Review CORS settings in `main.py` - set specific origins
- [ ] Enable HTTPS with reverse proxy (nginx)
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Enable logging to file
- [ ] Test all API endpoints
- [ ] Set appropriate file size limits
- [ ] Enable request validation
- [ ] Test error handling

### Frontend
- [ ] Update `VITE_API_BASE_URL` to production backend URL
- [ ] Run `npm run build` and test dist folder
- [ ] Enable caching strategies
- [ ] Configure CDN if needed
- [ ] Set up analytics
- [ ] Test on multiple browsers
- [ ] Verify responsive design
- [ ] Check accessibility
- [ ] Minify and optimize assets
- [ ] Test error states and edge cases

### Infrastructure
- [ ] Set up database backups (daily)
- [ ] Configure monitoring and alerting
- [ ] Set up log aggregation
- [ ] Configure auto-scaling if needed
- [ ] Set up DNS and domain
- [ ] Test disaster recovery procedures
- [ ] Document deployment process
- [ ] Set up CI/CD pipeline

### Security
- [ ] Run security audit on dependencies
- [ ] Update all packages to latest secure versions
- [ ] Review authentication implementation
- [ ] Test authorization on all endpoints
- [ ] Enable HTTPS only
- [ ] Set security headers (CSP, X-Frame-Options, etc.)
- [ ] Configure CORS properly
- [ ] Implement request signing/validation
- [ ] Regular security updates schedule
- [ ] Penetration testing if possible

### Testing
- [ ] Unit tests for critical functions
- [ ] Integration tests for API endpoints
- [ ] End-to-end tests for user workflows
- [ ] Load testing
- [ ] Security testing
- [ ] Browser compatibility testing
- [ ] Mobile device testing

## Deployment

### Backend Deployment
```bash
# Use Gunicorn for production
gunicorn backend.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy dist folder to static hosting or web server
```

### Database Migration
- [ ] Backup existing database
- [ ] Run migrations if any
- [ ] Verify data integrity
- [ ] Test backups restore correctly

## Post-Deployment

- [ ] Verify all endpoints working
- [ ] Check logs for errors
- [ ] Monitor system resources
- [ ] Verify backups are running
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Monitor error rates
- [ ] Set up alerting thresholds
- [ ] Document any custom configurations
- [ ] Create runbook for common issues

## Monitoring

### Metrics to Track
- API response times
- Error rates by endpoint
- Database performance
- Disk space usage
- Memory usage
- CPU usage
- File upload success rate
- Authentication failures
- Chat/Analysis processing times

### Alerting
- 500 errors
- High error rate (>1%)
- Database connection failures
- Disk space < 10%
- Memory > 90%
- Response time > 5s

## Regular Maintenance

- [ ] Weekly: Review logs and error rates
- [ ] Monthly: Update dependencies and security patches
- [ ] Monthly: Review and optimize database queries
- [ ] Quarterly: Security audit
- [ ] Quarterly: Performance optimization
- [ ] Annually: Major version updates planning
