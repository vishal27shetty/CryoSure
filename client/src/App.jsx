import { useState, useEffect, useRef } from 'react'

function App() {
  const [formData, setFormData] = useState({
    storageType: '',
    minTemp: '',
    maxTemp: '',
    maxHumidity: '',
    facilityName: '',
    location: '',
    capacity: '',
    alertEmail: '',
    alertPhone: '',
    emergencyContact: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [animationPhase, setAnimationPhase] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isTyping, setIsTyping] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [savedConfigs, setSavedConfigs] = useState([])
  const [selectedConfig, setSelectedConfig] = useState(null)
  const [showMetrics, setShowMetrics] = useState(false)
  const [realTimeData, setRealTimeData] = useState({
    currentTemp: -2.5,
    currentHumidity: 67.3,
    status: 'optimal',
    lastUpdate: new Date()
  })
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [currentView, setCurrentView] = useState('config') // 'config' or 'monitoring'
  const [liveSensorData, setLiveSensorData] = useState([])
  const [isLoadingLiveData, setIsLoadingLiveData] = useState(false)
  const [lastDataFetch, setLastDataFetch] = useState(null)
  const [dataFetchError, setDataFetchError] = useState(null)
  const canvasRef = useRef(null)
  const formRef = useRef(null)

  const storageTypes = [
    { value: 'Vaccine', icon: '💉', temp: { min: -80, max: -60 }, humidity: 60, color: 'from-red-500 to-pink-500' },
    { value: 'Produce', icon: '🥬', temp: { min: 0, max: 4 }, humidity: 85, color: 'from-green-500 to-emerald-500' },
    { value: 'Meat', icon: '🥩', temp: { min: -2, max: 2 }, humidity: 80, color: 'from-red-600 to-red-400' },
    { value: 'Dairy', icon: '🥛', temp: { min: 1, max: 4 }, humidity: 75, color: 'from-blue-400 to-cyan-400' },
    { value: 'Pharmaceuticals', icon: '💊', temp: { min: 2, max: 8 }, humidity: 65, color: 'from-purple-500 to-indigo-500' },
    { value: 'Frozen', icon: '🧊', temp: { min: -25, max: -18 }, humidity: 90, color: 'from-cyan-500 to-blue-500' },
    { value: 'Wine', icon: '🍷', temp: { min: 10, max: 15 }, humidity: 70, color: 'from-purple-600 to-red-500' },
    { value: 'Custom', icon: '⚙️', temp: { min: 0, max: 0 }, humidity: 50, color: 'from-gray-500 to-gray-400' }
  ]

  const temperaturePresets = {
    'Ultra Low': { min: -80, max: -60, color: 'text-blue-300' },
    'Freezer': { min: -25, max: -18, color: 'text-cyan-300' },
    'Refrigerated': { min: 0, max: 4, color: 'text-green-300' },
    'Cool': { min: 8, max: 15, color: 'text-yellow-300' },
    'Ambient': { min: 18, max: 25, color: 'text-orange-300' }
  }

  const steps = [
    { title: 'Basic Info', icon: '📋', description: 'Storage type and facility details' },
    { title: 'Temperature', icon: '🌡️', description: 'Temperature range configuration' },
    { title: 'Environment', icon: '💧', description: 'Humidity and air quality settings' },
    { title: 'Review', icon: '✅', description: 'Confirm and save configuration' }
  ]

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4)
    }, 3000)

    // Initialize particle canvas
    initializeParticles()
    animateParticles()

    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Particle system
  const particles = useRef([])
  
  const initializeParticles = () => {
    particles.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2
    }))
  }

  const animateParticles = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.current.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }
    animate()
  }

  const validateField = (name, value) => {
    const errors = { ...validationErrors }
    
    switch (name) {
      case 'minTemp':
      case 'maxTemp':
        if (value && (isNaN(value) || value < -100 || value > 100)) {
          errors[name] = 'Temperature must be between -100°C and 100°C'
        } else {
          delete errors[name]
        }
        break
      case 'maxHumidity':
        if (value && (isNaN(value) || value < 0 || value > 100)) {
          errors[name] = 'Humidity must be between 0% and 100%'
        } else {
          delete errors[name]
        }
        break
      case 'alertEmail':
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          errors[name] = 'Please enter a valid email address'
        } else {
          delete errors[name]
        }
        break
      case 'alertPhone':
        if (value && !/^\+?[\d\s\-\(\)]{10,}$/.test(value)) {
          errors[name] = 'Please enter a valid phone number'
        } else {
          delete errors[name]
        }
        break
      default:
        break
    }
    
    setValidationErrors(errors)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    validateField(name, value)
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 1000)
  }

  const handleStorageTypeSelect = (type) => {
    const selectedType = storageTypes.find(t => t.value === type.value)
    setFormData(prev => ({
      ...prev,
      storageType: type.value,
      minTemp: selectedType.temp.min.toString(),
      maxTemp: selectedType.temp.max.toString(),
      maxHumidity: selectedType.humidity.toString()
    }))
  }

  const handlePresetSelect = (preset) => {
    const presetData = temperaturePresets[preset]
    setFormData(prev => ({
      ...prev,
      minTemp: presetData.min.toString(),
      maxTemp: presetData.max.toString()
    }))
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setIsLoading(true)
    setMessage({ text: '', type: '' })
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      const apiUrl = import.meta.env.VITE_API_GATEWAY_URL
      const requestBody = {
        storageType: formData.storageType,
        minTemp: parseFloat(formData.minTemp),
        maxTemp: parseFloat(formData.maxTemp),
        maxHumidity: parseFloat(formData.maxHumidity)
      }
      
      console.log('Request body:', requestBody)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('Response data:', responseData)
        
        setMessage({ text: 'Configuration saved successfully! System is now monitoring your parameters.', type: 'success' })
        
        // Save to local storage
        const newConfig = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString(),
          status: 'active'
        }
        setSavedConfigs(prev => [newConfig, ...prev])
        
        // Add success notification
        addNotification('Configuration saved successfully', 'success')
        
        // Switch to monitoring view after successful save
        setCurrentView('monitoring')
        
        // Reset form
        setFormData({
          storageType: '',
          minTemp: '',
          maxTemp: '',
          maxHumidity: '',
          facilityName: '',
          location: '',
          capacity: '',
          alertEmail: '',
          alertPhone: '',
          emergencyContact: ''
        })
        setCurrentStep(1)
      } else {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error details:', error)
      setMessage({ 
        text: `Error: ${error.message || 'Failed to save configuration. Please check your connection and try again.'}`, 
        type: 'error' 
      })
      addNotification('Failed to save configuration', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const addNotification = (text, type) => {
    const notification = {
      id: Date.now(),
      text,
      type,
      timestamp: new Date()
    }
    setNotifications(prev => [notification, ...prev.slice(0, 4)])
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const getStepProgress = () => (currentStep / steps.length) * 100

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Basic Configuration</h3>
              <p className="text-gray-400">Let's start with the fundamentals</p>
            </div>

            {/* Storage Type Grid */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-4 tracking-wide uppercase">
                Select Storage Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {storageTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleStorageTypeSelect(type)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      formData.storageType === type.value
                        ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="text-white font-semibold text-sm">{type.value}</div>
                      <div className={`text-xs mt-1 bg-gradient-to-r ${type.color} bg-clip-text text-transparent font-medium`}>
                        {type.temp.min}°C to {type.temp.max}°C
                      </div>
                    </div>
                    {formData.storageType === type.value && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Facility Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide uppercase">
                  Facility Name
                </label>
                <input
                  type="text"
                  name="facilityName"
                  value={formData.facilityName}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('facilityName')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Main Cold Storage Facility"
                  className="w-full px-6 py-4 bg-black/50 border border-gray-700 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide uppercase">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('location')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Warehouse District, City"
                  className="w-full px-6 py-4 bg-black/50 border border-gray-700 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide uppercase">
                Storage Capacity (m³)
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('capacity')}
                onBlur={() => setFocusedField('')}
                placeholder="1000"
                className="w-full px-6 py-4 bg-black/50 border border-gray-700 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-gray-600"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Temperature Configuration</h3>
              <p className="text-gray-400">Set your optimal temperature range</p>
            </div>

            {/* Temperature Presets */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-4 tracking-wide uppercase">
                Quick Presets
              </label>
              <div className="flex flex-wrap gap-3">
                {Object.entries(temperaturePresets).map(([name, preset]) => (
                  <button
                    key={name}
                    onClick={() => handlePresetSelect(name)}
                    className={`px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 ${preset.color} border-current bg-current/10`}
                  >
                    <div className="font-semibold">{name}</div>
                    <div className="text-xs opacity-75">{preset.min}°C to {preset.max}°C</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Range */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide uppercase">
                  Minimum Temperature (°C)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="minTemp"
                    value={formData.minTemp}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('minTemp')}
                    onBlur={() => setFocusedField('')}
                    required
                    step="0.1"
                    placeholder="-40.0"
                    className="w-full px-6 py-4 bg-black/50 border border-gray-700 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-gray-600"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                {validationErrors.minTemp && (
                  <p className="text-red-400 text-sm mt-2">{validationErrors.minTemp}</p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide uppercase">
                  Maximum Temperature (°C)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="maxTemp"
                    value={formData.maxTemp}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('maxTemp')}
                    onBlur={() => setFocusedField('')}
                    required
                    step="0.1"
                    placeholder="10.0"
                    className="w-full px-6 py-4 bg-black/50 border border-gray-700 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-gray-600"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                {validationErrors.maxTemp && (
                  <p className="text-red-400 text-sm mt-2">{validationErrors.maxTemp}</p>
                )}
              </div>
            </div>

            {/* Temperature Visualization */}
            {formData.minTemp && formData.maxTemp && (
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <h4 className="text-white font-semibold mb-4">Temperature Range Visualization</h4>
                <div className="relative h-20 bg-gradient-to-r from-blue-600 via-green-500 to-red-500 rounded-lg overflow-hidden">
                  <div 
                    className="absolute top-0 h-full bg-black/70 transition-all duration-500"
                    style={{
                      left: `${Math.max(0, (parseFloat(formData.minTemp || -40) + 40) / 140 * 100)}%`,
                      right: `${Math.max(0, 100 - (parseFloat(formData.maxTemp || 40) + 40) / 140 * 100)}%`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded">
                      {formData.minTemp}°C - {formData.maxTemp}°C
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Environmental Controls</h3>
              <p className="text-gray-400">Configure humidity and air quality parameters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3 tracking-wide uppercase">
                Maximum Humidity (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="maxHumidity"
                  value={formData.maxHumidity}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('maxHumidity')}
                  onBlur={() => setFocusedField('')}
                  required
                  step="0.1"
                  placeholder="85.0"
                  className="w-full px-6 py-4 bg-black/50 border border-gray-700 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-gray-600"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
              </div>
              {validationErrors.maxHumidity && (
                <p className="text-red-400 text-sm mt-2">{validationErrors.maxHumidity}</p>
              )}
            </div>

            {/* Humidity Visualization */}
            {formData.maxHumidity && (
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <h4 className="text-white font-semibold mb-4">Humidity Level Indicator</h4>
                <div className="relative h-8 bg-gray-700 rounded-lg overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 relative"
                    style={{ width: `${Math.min(100, parseFloat(formData.maxHumidity || 0))}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {formData.maxHumidity}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Environment Settings */}
            <div className="space-y-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full p-4 bg-gray-800/50 rounded-xl border border-gray-700 text-white hover:bg-gray-800/70 transition-all duration-200"
              >
                <span className="font-semibold">Advanced Environmental Settings</span>
                <svg 
                  className={`w-5 h-5 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdvanced && (
                <div className="space-y-4 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                      <span className="text-gray-300">Air Circulation</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                      <span className="text-gray-300">Defrost Cycle</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Review & Confirm</h3>
              <p className="text-gray-400">Review your configuration before saving</p>
            </div>

            {/* Configuration Summary */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <h4 className="text-white font-semibold mb-6">Configuration Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Storage Type:</span>
                    <span className="text-white font-medium">{formData.storageType || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Temperature Range:</span>
                    <span className="text-white font-medium">{formData.minTemp}°C - {formData.maxTemp}°C</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-gray-300">Max Humidity:</span>
                    <span className="text-white font-medium">{formData.maxHumidity}%</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-300">Facility:</span>
                    <span className="text-white font-medium">{formData.facilityName || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-300">Location:</span>
                    <span className="text-white font-medium">{formData.location || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-300">Capacity:</span>
                    <span className="text-white font-medium">{formData.capacity || 'Not specified'} m³</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="terms" className="text-gray-300 text-sm">
                  I agree to the terms and conditions and acknowledge that CryoSure will monitor my storage facility according to the specified parameters. I understand that alerts will be sent via SNS notifications.
                </label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Fetch live sensor data from API
  const fetchLiveData = async () => {
    setIsLoadingLiveData(true)
    setDataFetchError(null)
    
    try {
      const apiUrl = import.meta.env.VITE_API_ENDPOINT
      if (!apiUrl) {
        throw new Error('VITE_API_ENDPOINT environment variable is not configured')
      }

      console.log('Fetching data from:', apiUrl)
      console.log('Environment variables:', {
        VITE_API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT,
        VITE_API_GATEWAY_URL: import.meta.env.VITE_API_GATEWAY_URL
      })

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const result = await response.json()
        console.log('API Response:', result)
        // Fix: Parse the body if it's a string
        let dataObj = result
        if (typeof result.body === 'string') {
          dataObj = JSON.parse(result.body)
        }
        const sensorData = dataObj.data || []
        setLiveSensorData(sensorData)
        setLastDataFetch(new Date())
        
        // Update real-time data with latest values
        if (sensorData.length > 0) {
          const latestData = sensorData[0] // First item is the most recent due to sorting
          setRealTimeData(prev => ({
            ...prev,
            currentTemp: parseFloat(latestData.temperature || prev.currentTemp),
            currentHumidity: parseFloat(latestData.humidity || prev.currentHumidity),
            status: getStatusFromData(latestData),
            lastUpdate: new Date(parseInt(latestData.timestamp) || Date.now())
          }))
        }
      } else {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error fetching live data:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      // More specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setDataFetchError('Network error: Unable to connect to the API. Please check your internet connection and API endpoint.')
      } else if (error.message.includes('CORS')) {
        setDataFetchError('CORS error: The API server is not allowing requests from this domain. Please check CORS configuration.')
      } else {
        setDataFetchError(`Error: ${error.message}`)
      }
    } finally {
      setIsLoadingLiveData(false)
    }
  }

  // Determine status based on sensor data
  const getStatusFromData = (data) => {
    const temp = parseFloat(data.temperature || 0)
    const humidity = parseFloat(data.humidity || 0)
    
    // Enhanced status logic based on temperature and humidity thresholds
    if (temp < -10 || temp > 10 || humidity > 90) {
      return 'critical'
    } else if (temp < -5 || temp > 5 || humidity > 80) {
      return 'warning'
    } else {
      return 'optimal'
    }
  }

  // Auto-refresh live data
  useEffect(() => {
    if (currentView === 'monitoring') {
      fetchLiveData()
      const interval = setInterval(fetchLiveData, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [currentView])

  // Render monitoring dashboard
  const renderMonitoringDashboard = () => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'optimal': return 'text-green-400 bg-green-400/20'
        case 'warning': return 'text-yellow-400 bg-yellow-400/20'
        case 'critical': return 'text-red-400 bg-red-400/20'
        default: return 'text-gray-400 bg-gray-400/20'
      }
    }

    const getStatusIcon = (status) => {
      switch (status) {
        case 'optimal': return '✅'
        case 'warning': return '⚠️'
        case 'critical': return '🚨'
        default: return '❓'
      }
    }

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-white mb-2">Live Monitoring Dashboard</h3>
          <p className="text-gray-400">Real-time sensor data from your storage facility</p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <button
              onClick={fetchLiveData}
              disabled={isLoadingLiveData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoadingLiveData ? 'Refreshing...' : '🔄 Refresh'}
            </button>
            {lastDataFetch && (
              <span className="text-gray-400 text-sm">
                Last updated: {lastDataFetch.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Error Display */}
        {dataFetchError && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-xl">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span>Error fetching data: {dataFetchError}</span>
            </div>
          </div>
        )}

        {/* Current Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Current Temperature</h4>
              <span className="text-2xl">🌡️</span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {realTimeData.currentTemp.toFixed(1)}°C
            </div>
            <div className="text-sm text-gray-400">
              Last reading: {realTimeData.lastUpdate.toLocaleTimeString()}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Current Humidity</h4>
              <span className="text-2xl">💧</span>
            </div>
            <div className="text-3xl font-bold text-cyan-400 mb-2">
              {realTimeData.currentHumidity.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">
              Last reading: {realTimeData.lastUpdate.toLocaleTimeString()}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">System Status</h4>
              <span className="text-2xl">{getStatusIcon(realTimeData.status)}</span>
            </div>
            <div className={`text-3xl font-bold mb-2 px-3 py-1 rounded-lg ${getStatusColor(realTimeData.status)}`}>
              {realTimeData.status.toUpperCase()}
            </div>
            <div className="text-sm text-gray-400">
              Monitoring active
            </div>
          </div>
        </div>

        {/* Live Data Table */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h4 className="text-white font-semibold">Recent Sensor Readings</h4>
            <p className="text-gray-400 text-sm mt-1">Latest 20 sensor data points</p>
          </div>
          
          {isLoadingLiveData && liveSensorData.length === 0 ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading sensor data...</p>
            </div>
          ) : liveSensorData.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400">No sensor data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Temperature (°C)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Humidity (%)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {liveSensorData.map((reading, index) => (
                    <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {(() => {
                          try {
                            const timestamp = parseInt(reading.timestamp)
                            return isNaN(timestamp)
                              ? new Date(reading.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                              : new Date(timestamp * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                          } catch (error) {
                            return 'Invalid timestamp'
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${
                          parseFloat(reading.temperature || 0) < -5 || parseFloat(reading.temperature || 0) > 5 
                            ? 'text-red-400' 
                            : 'text-green-400'
                        }`}>
                          {parseFloat(reading.temperature || 0).toFixed(1)}°C
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${
                          parseFloat(reading.humidity || 0) > 80 
                            ? 'text-red-400' 
                            : 'text-green-400'
                        }`}>
                          {parseFloat(reading.humidity || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getStatusFromData(reading))}`}>
                          {getStatusIcon(getStatusFromData(reading))} {getStatusFromData(reading)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Loading CryoSure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black relative overflow-hidden">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-20"
        style={{ zIndex: 0 }}
      />

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">❄️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CryoSure</h1>
              <p className="text-gray-400 text-sm">Intelligent Cold Storage Monitoring</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('config')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentView === 'config'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ⚙️ Configuration
              </button>
              <button
                onClick={() => setCurrentView('monitoring')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentView === 'monitoring'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📊 Live Monitoring
              </button>
            </div>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            >
              🔔
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Metrics Toggle */}
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            >
              📊
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-6">
        {currentView === 'config' ? (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      index + 1 <= currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                        index + 1 < currentStep ? 'bg-blue-500' : 'bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getStepProgress()}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8 shadow-2xl">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-700/50">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentStep === 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600 hover:scale-105'
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center space-x-4">
                  {currentStep < steps.length ? (
                    <button
                      onClick={nextStep}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        isLoading
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 shadow-lg'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        'Save Configuration'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`mt-6 p-4 rounded-xl ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : 'bg-red-500/20 border border-red-500/50 text-red-400'
              }`}>
                {message.text}
              </div>
            )}
          </>
        ) : (
          /* Monitoring Dashboard */
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8 shadow-2xl">
            {renderMonitoringDashboard()}
          </div>
        )}
      </main>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-20 right-6 w-80 bg-gray-800/95 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-2xl z-50">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-gray-400 text-center">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div key={notification.id} className="p-4 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-white text-sm">{notification.text}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Real-time Metrics Panel */}
      {showMetrics && (
        <div className="fixed top-20 right-6 w-80 bg-gray-800/95 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-2xl z-50">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Real-time Metrics</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Temperature</span>
              <span className="text-white font-semibold">{realTimeData.currentTemp.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Humidity</span>
              <span className="text-white font-semibold">{realTimeData.currentHumidity.toFixed(1)}%</span>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Last updated: {realTimeData.lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App