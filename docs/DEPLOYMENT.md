# Deployment and Domain Guide

## Recommended hosting

Use Vercel for the Next.js application. Preview deployments make every pull request testable on an HTTPS URL, including real iPhone Safari and PWA behavior. Confirm current plan limits before relying on any free tier for commercial ad-supported traffic.

## Preview deployment

1. Push the GitHub repository.
2. Create a Vercel account and import the repository.
3. Accept the detected Next.js build settings.
4. Deploy the preview.
5. Test the full flow on the preview URL.
6. Keep production deployment blocked until the release checklist passes.

## Domain sequence

1. Approve product name.
2. Verify live domain availability and trademark conflicts.
3. Buy the domain using an account protected by two-factor authentication.
4. Add the domain to the Vercel project.
5. Apply the exact DNS records Vercel displays at that time.
6. Choose one canonical hostname (`www` or apex) and redirect the other.
7. Wait for DNS and SSL verification.
8. Update the application's production URL, canonical tags, sitemap, analytics, and Search Console property.

Never copy DNS values from this document; use the current values displayed by the host.

## Production release checklist

- [ ] All CI checks pass on the release commit
- [ ] No secrets or personal test data are committed
- [ ] Environment variables are documented and scoped correctly
- [ ] Home, create, preset, how-to, privacy, terms, about, and contact pages work
- [ ] Manual and auto mode pass with 2 and 25 names
- [ ] Upload, refresh recovery, copy, download, share, and email-draft fallbacks work
- [ ] Chrome desktop and real iPhone Safari pass
- [ ] PWA installs from the live HTTPS domain
- [ ] Offline fallback behaves correctly
- [ ] Canonical URL, robots, sitemap, and social cards are correct
- [ ] Lighthouse and accessibility checks meet release targets
- [ ] Analytics excludes participant/event data
- [ ] Error monitoring and rollback owner are defined
- [ ] Previous production deployment can be restored

## Search launch

1. Verify the domain property in Google Search Console.
2. Submit the production sitemap.
3. Inspect the home page and primary use-case URLs.
4. Monitor indexing and Core Web Vitals.
5. Fix technical issues before expanding content.

## Rollback

Tag stable production releases in Git. If a deployment introduces a critical regression, promote the previous known-good Vercel deployment or revert the faulty Git commit through a new reviewed commit. Record the incident and add a regression test before relaunching.

