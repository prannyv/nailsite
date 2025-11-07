# Quick Start Guide - PolishedByLauren

## 🚀 Running the Application

### Development Mode

```bash
cd nailsite
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📱 Using the Application

### Adding an Appointment

1. Click the pink **+** button in the bottom-right corner
2. Select **"New Appointment"**
3. Fill in the form:
   - **Date & Time** (required)
   - **Client Name** (optional)
   - **Service Type** (Gel X, Gel Manicure, or Builder Gel)
   - **Nail Length** (if Gel X is selected)
   - **Add-ons** (French tip, designs, 3D gel, charms)
   - **Inspiration Photos** (upload reference images)
   - **Inspiration Notes** (text description)
4. The price calculates automatically
5. Click **"Add Appointment"**

### Managing Appointments

- **View**: Click on a calendar day to select it, or scroll through the list
- **Edit**: Expand an appointment card and click **Edit**
- **Delete**: Expand an appointment card and click **Delete**
- **Upcoming**: View the next 7 days of appointments in the left sidebar

### Adding Press-Ons

1. Click the pink **+** button
2. Select **"New Press-On"**
3. Fill in:
   - **Name** (required)
   - **Description**
   - **Size** (e.g., S, M, L)
   - **Quantity**
   - **Status** (Available, Reserved, Sold)
   - **Photos**
4. Click **"Add Press-On"**

### Managing Press-Ons

- **View**: Scroll through the Press-Ons Inventory section
- **Edit**: Expand a press-on card and click **Edit**
- **Delete**: Expand a press-on card and click **Delete**

## 💾 Data Storage

All data is automatically saved to your browser's localStorage:
- Appointments persist across browser sessions
- Press-on inventory is saved locally
- No backend required for basic functionality

## 🎨 Features

✅ **Calendar View** - Monthly calendar with appointment markers
✅ **Appointment Tracking** - Full appointment lifecycle management  
✅ **Price Calculator** - Automatic pricing based on services
✅ **Photo Upload** - Add inspiration images for appointments and press-ons
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Local Storage** - Data persists in your browser

## 🎯 Next Steps (Optional Backend)

See `implementation-plan.md` for details on adding:
- Cloud database (PostgreSQL/MongoDB)
- User authentication
- Image hosting (Cloudinary/AWS S3)
- API endpoints
- Email notifications
- Calendar sync

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill the process or use a different port
npm run dev -- --port 3000
```

**Build fails?**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Styles not loading?**
```bash
# Rebuild Tailwind CSS
npm run build
```

## 📞 Support

For issues or questions, refer to:
- `README.md` for full documentation
- `implementation-plan.md` for architecture details
- React/Vite documentation for framework questions

---

**Enjoy using PolishedByLauren! 💅💖**

