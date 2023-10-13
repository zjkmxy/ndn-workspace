# Bug fixes
- General
  - It stops working after sync a large amount of data.
- Navibar
  - Use a better drawer as navibar.
- Project
  - Handle special file names (spaces, slashes, etc.)
- Docs
  - Make it work under Yjs
  - Navibar's link to docs does not return to top level.
- Calendar
  - Handle 12:00 AM correctly
  - Handle multi-day event correctly

# Important Features
- Decouple backend with frontend. Consider Redux?
- Use IndexDB Storage
- Add security. How to bootstrap?
  - So our decision is:
    - Use the testbed trust anchor
    - Ask the user to upload the safebag with testbed certificate for the first use
- Switch to Yjs
- Latex: multifile support

# Further Enhancement
- Shared worker to sync packets
- PWA
- Multiple ways to connect
- Multiple context switching
- Encryption

Search code for other TODOs
