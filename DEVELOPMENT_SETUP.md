# Static IP Development Setup - LOCKED CONFIGURATION

## Current Configuration (DO NOT CHANGE)

**Backend IP**: `10.42.0.100` (Static - configured in Windows Wi-Fi settings)
**Backend Port**: `3000`
**Frontend API URL**: `http://10.42.0.100:3000/api/v1`

## How to Start Development

### 1. Start Backend
```bash
cd backend
npm run start:dev
```

### 2. Start Frontend (LAN Mode - NO TUNNEL)
```bash
cd frontend
npx expo start --clear
```

**IMPORTANT**: 
- Do NOT use `--tunnel` flag
- Do NOT use `expo start --tunnel`
- Always use LAN mode for stable cookie-based auth

### 3. Connect Phone
- Ensure phone is on the SAME Wi-Fi network as your PC
- Scan QR code from Expo CLI
- App will connect to `http://10.42.0.100:3000/api/v1`

## Troubleshooting

### If you get "Network request failed":

1. **Verify IP hasn't changed**:
   ```bash
   ipconfig
   ```
   Look for "Wi-Fi" adapter, check IPv4 Address is still `10.42.0.100`

2. **If IP changed, update frontend/.env**:
   ```
   EXPO_PUBLIC_API_URL=http://<NEW_IP>:3000/api/v1
   ```

3. **Restart frontend**:
   ```bash
   npx expo start --clear
   ```

### If Expo shows "Tunnel connected":

1. **Kill all Expo processes**
2. **Uninstall ngrok** (if it reinstalls):
   ```bash
   npm uninstall @expo/ngrok
   ```
3. **Clear cache and restart**:
   ```bash
   npx expo start --clear
   ```

## Windows Static IP Configuration

To prevent IP from changing on restart:

1. Open **Settings** → **Network & Internet** → **Wi-Fi**
2. Click your connected network
3. Under **IP assignment**, click **Edit**
4. Select **Manual**, enable **IPv4**
5. Enter:
   - **IP address**: `10.42.0.100`
   - **Subnet prefix length**: `24`
   - **Gateway**: `10.42.0.1`
   - **Preferred DNS**: `8.8.8.8`
6. Click **Save**

## Firewall

Port 3000 is already open via `fix_firewall.bat`. If connection fails, run as Administrator:
```bash
fix_firewall.bat
```

## Infrastructure Status: FROZEN ✅

- ✅ Auth system: STABLE
- ✅ Cookie handling: WORKING
- ✅ Static IP: CONFIGURED
- ✅ Tunnels: REMOVED
- ✅ Network: LAN-ONLY

**DO NOT MODIFY**:
- Backend auth logic
- Cookie configuration
- API client error handling
- Tunnel setup (keep it disabled)

## Next Phase: UI & Features

You can now safely work on:
- Tab navigation styling
- Equb creation flow
- Member management
- Contribution tracking
- Payout workflows

Network infrastructure is locked and should not require changes.
