# CryoSure Frontend

A modern React application for configuring cold chain storage thresholds and monitoring real-time sensor data with a beautiful dark theme UI.

## Features

- 🎨 **Dark Theme UI** - Modern, aesthetic interface with gradient backgrounds
- 📱 **Responsive Design** - Mobile-friendly layout
- ⚡ **Real-time Configuration** - Update cold storage thresholds via API
- 📊 **Live Monitoring Dashboard** - Real-time sensor data visualization
- 🔄 **Auto-refresh** - Automatic data updates every 10 seconds
- 🔒 **Secure** - No AWS credentials in frontend, all via API Gateway
- 🚀 **Fast** - Built with Vite for optimal performance

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Inter Font** - Clean, modern typography

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the client directory:
   ```bash
   # API Gateway Invoke URL for the CryoSure configuration endpoint
   VITE_API_GATEWAY_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod/config
   
   # API endpoint for live sensor data monitoring
   VITE_API_ENDPOINT=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod/sensor-data
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_GATEWAY_URL` | API Gateway endpoint for configuration updates | `https://abc123.execute-api.us-east-1.amazonaws.com/prod/config` |
| `VITE_API_ENDPOINT` | API Gateway endpoint for live sensor data | `https://abc123.execute-api.us-east-1.amazonaws.com/prod/sensor-data` |

### API Integration

The frontend sends POST requests to your API Gateway with the following payload:

```json
{
  "storageType": "Vaccine",
  "minTemp": -20.0,
  "maxTemp": 8.0,
  "maxHumidity": 85.0
}
```

For live monitoring, the frontend makes GET requests to fetch sensor data in the following format:

```json
{
  "data": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "temperature": -2.5,
      "humidity": 67.3,
      "sensor_id": "sensor_001"
    }
  ]
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### AWS S3 Static Website Hosting

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder to your S3 bucket**

3. **Configure S3 bucket for static website hosting**

4. **Set up CloudFront (optional) for CDN**

### Build Output

The `npm run build` command generates a `dist` folder containing:
- Optimized HTML, CSS, and JavaScript
- Static assets ready for deployment
- Production-ready bundle

## Project Structure

```
client/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Minimal CSS (Tailwind handles styling)
│   ├── index.css        # Tailwind imports and global styles
│   └── main.jsx         # Application entry point
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## Features

### Storage Configuration Form

- **Storage Type Selection** - Dropdown with predefined types (Vaccine, Produce, Meat, etc.)
- **Temperature Range** - Min/Max temperature inputs with °C units
- **Humidity Control** - Maximum humidity percentage input
- **Real-time Validation** - Form validation and error handling
- **Loading States** - Visual feedback during API calls
- **Success/Error Messages** - Clear user feedback

### Live Monitoring Dashboard

- **Real-time Data Display** - Current temperature, humidity, and system status
- **Sensor Data Table** - Latest 20 sensor readings with timestamps
- **Status Indicators** - Color-coded status (optimal, warning, critical)
- **Auto-refresh** - Automatic data updates every 10 seconds
- **Manual Refresh** - Manual refresh button for immediate updates
- **Error Handling** - Clear error messages for API failures
- **System Health** - Connectivity and system status indicators
- **Quick Actions** - Export data, test alerts, system settings

### UI/UX Highlights

- **Dark Theme** - Professional dark interface with blue/cyan accents
- **Gradient Backgrounds** - Subtle gradients for visual depth
- **Glass Morphism** - Semi-transparent cards with backdrop blur
- **Smooth Animations** - Hover effects and transitions
- **Responsive Grid** - Adapts to different screen sizes
- **Accessibility** - Proper labels, focus states, and semantic HTML
- **View Toggle** - Easy switching between configuration and monitoring views

## Backend Integration

This frontend integrates with the CryoSure backend stack:

- **AWS IoT Core** - Sensor data ingestion
- **AWS Lambda** - Anomaly detection and configuration updates
- **Amazon DynamoDB** - Data storage (ColdChainSensorData, CryosureColdStorageConfig)
- **Amazon API Gateway** - REST API endpoints
- **Amazon SNS** - Alert notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the CryoSure cold chain monitoring system.
