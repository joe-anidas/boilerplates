import { useState, useEffect, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [salesForm, setSalesForm] = useState({ date: '', amount: '' })
  const [visitorsForm, setVisitorsForm] = useState({ date: '', count: '' })
  const [categoryForm, setCategoryForm] = useState({ category: '', value: '' })
  const [loading, setLoading] = useState(false)

  const [salesChart, setSalesChart] = useState({ labels: [], datasets: [] })
  const [visitorsChart, setVisitorsChart] = useState({ labels: [], datasets: [] })
  const [categoriesChart, setCategoriesChart] = useState({ labels: [], datasets: [] })

  const [seedForm, setSeedForm] = useState({
    startDate: '',
    endDate: '',
    salesCount: 30,
    visitorsCount: 30,
    categoryItems: 20
  })

  const fetchCharts = async () => {
    try {
      const [salesRes, visitorsRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE}/dashboards/sales`),
        fetch(`${API_BASE}/dashboards/visitors`),
        fetch(`${API_BASE}/dashboards/categories`)
      ])
      const [salesData, visitorsData, categoriesData] = await Promise.all([
        salesRes.json(),
        visitorsRes.json(),
        categoriesRes.json()
      ])

      setSalesChart({
        labels: salesData.labels || [],
        datasets: [
          {
            label: 'Sales',
            data: (salesData.datasets?.[0]?.data) || [],
            borderColor: 'rgb(37, 99, 235)',
            backgroundColor: 'rgba(37, 99, 235, 0.2)'
          }
        ]
      })

      setVisitorsChart({
        labels: visitorsData.labels || [],
        datasets: [
          {
            label: 'Visitors',
            data: (visitorsData.datasets?.[0]?.data) || [],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)'
          }
        ]
      })

      setCategoriesChart({
        labels: categoriesData.labels || [],
        datasets: [
          {
            label: 'Categories',
            data: (categoriesData.datasets?.[0]?.data) || [],
            backgroundColor: [
              'rgba(59, 130, 246, 0.6)',
              'rgba(16, 185, 129, 0.6)',
              'rgba(234, 179, 8, 0.6)',
              'rgba(239, 68, 68, 0.6)',
              'rgba(99, 102, 241, 0.6)'
            ],
            borderColor: [
              'rgb(59, 130, 246)',
              'rgb(16, 185, 129)',
              'rgb(234, 179, 8)',
              'rgb(239, 68, 68)',
              'rgb(99, 102, 241)'
            ],
            borderWidth: 1
          }
        ]
      })
    } catch (error) {
      console.error('Error fetching charts:', error)
      setSalesChart({ labels: [], datasets: [] })
      setVisitorsChart({ labels: [], datasets: [] })
      setCategoriesChart({ labels: [], datasets: [] })
    }
  }

  const submitSale = async (e) => {
    e.preventDefault()
    if (!salesForm.date || !salesForm.amount) {
      alert('Please provide date and amount')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: salesForm.date, amount: Number(salesForm.amount) })
      })
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to add sale')
      } else {
        setSalesForm({ date: '', amount: '' })
        fetchCharts()
      }
    } catch (error) {
      console.error('Error adding sale:', error)
      alert('Error adding sale. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitVisitors = async (e) => {
    e.preventDefault()
    if (!visitorsForm.date || !visitorsForm.count) {
      alert('Please provide date and count')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/visitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: visitorsForm.date, count: Number(visitorsForm.count) })
      })
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to add visitors record')
      } else {
        setVisitorsForm({ date: '', count: '' })
        fetchCharts()
      }
    } catch (error) {
      console.error('Error adding visitors record:', error)
      alert('Error adding visitors. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitCategory = async (e) => {
    e.preventDefault()
    if (!categoryForm.category || !categoryForm.value) {
      alert('Please provide category and value')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryForm.category, value: Number(categoryForm.value) })
      })
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to add category stat')
      } else {
        setCategoryForm({ category: '', value: '' })
        fetchCharts()
      }
    } catch (error) {
      console.error('Error adding category stat:', error)
      alert('Error adding category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load charts on component mount
  useEffect(() => {
    fetchCharts()
  }, [])

  const handleSalesChange = (e) => setSalesForm({ ...salesForm, [e.target.name]: e.target.value })
  const handleVisitorsChange = (e) => setVisitorsForm({ ...visitorsForm, [e.target.name]: e.target.value })
  const handleCategoryChange = (e) => setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value })
  const handleSeedChange = (e) => setSeedForm({ ...seedForm, [e.target.name]: e.target.value })

  const seedRandom = async () => {
    setLoading(true)
    try {
      const payload = {
        startDate: seedForm.startDate || undefined,
        endDate: seedForm.endDate || undefined,
        salesCount: Number(seedForm.salesCount) || 0,
        visitorsCount: Number(seedForm.visitorsCount) || 0,
        categoryItems: Number(seedForm.categoryItems) || 0
      }
      const res = await fetch(`${API_BASE}/seed/random`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to seed data')
      } else {
        await fetchCharts()
      }
    } catch (error) {
      console.error('Error seeding data:', error)
      alert('Error seeding data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Common options for consistent sizing and look
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    interaction: { intersect: false, mode: 'index' },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.06)' } }
    }
  }), [])

  // Extra visual: combined Sales vs Visitors timeseries
  const combinedTimeseries = useMemo(() => {
    const salesMap = new Map((salesChart.labels || []).map((l, i) => [l, (salesChart.datasets?.[0]?.data || [])[i] || 0]))
    const visitorsMap = new Map((visitorsChart.labels || []).map((l, i) => [l, (visitorsChart.datasets?.[0]?.data || [])[i] || 0]))
    const labelSet = new Set([...(salesMap.keys()), ...(visitorsMap.keys())])
    const labels = Array.from(labelSet).sort()
    return {
      labels,
      datasets: [
        {
          label: 'Sales',
          data: labels.map(l => salesMap.get(l) || 0),
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.2)'
        },
        {
          label: 'Visitors',
          data: labels.map(l => visitorsMap.get(l) || 0),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.2)'
        }
      ]
    }
  }, [salesChart, visitorsChart])

  // Extra visual: categories as bar chart
  const categoriesBar = useMemo(() => ({
    labels: categoriesChart.labels || [],
    datasets: [
      {
        label: 'Categories',
        data: (categoriesChart.datasets?.[0]?.data) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgb(99, 102, 241)'
      }
    ]
  }), [categoriesChart])

  return (
    <div className="max-w-6xl mx-auto p-5 md:p-6">
      <h1 className="text-center text-gray-800 mb-8 text-4xl font-bold">Dashboards</h1>

      {/* Seed Controls */}
      <div className="bg-white rounded-xl p-6 shadow mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="text-sm text-slate-600">Start Date</label>
            <input type="date" name="startDate" value={seedForm.startDate} onChange={handleSeedChange} className="p-2.5 border-2 border-slate-300 rounded-md" />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="text-sm text-slate-600">End Date</label>
            <input type="date" name="endDate" value={seedForm.endDate} onChange={handleSeedChange} className="p-2.5 border-2 border-slate-300 rounded-md" />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-32">
            <label className="text-sm text-slate-600">Sales</label>
            <input type="number" min="0" name="salesCount" value={seedForm.salesCount} onChange={handleSeedChange} className="p-2.5 border-2 border-slate-300 rounded-md" />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-36">
            <label className="text-sm text-slate-600">Visitors</label>
            <input type="number" min="0" name="visitorsCount" value={seedForm.visitorsCount} onChange={handleSeedChange} className="p-2.5 border-2 border-slate-300 rounded-md" />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-40">
            <label className="text-sm text-slate-600">Category Items</label>
            <input type="number" min="0" name="categoryItems" value={seedForm.categoryItems} onChange={handleSeedChange} className="p-2.5 border-2 border-slate-300 rounded-md" />
          </div>
          <button onClick={seedRandom} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-500">{loading ? 'Generating...' : 'Generate Random Data'}</button>
        </div>
      </div>

      {/* Sections: Form (left) + Visual (right) */}
      <div className="grid grid-cols-1 gap-8">
        {/* Sales Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-slate-50 p-6 rounded-xl shadow">
            <h2 className="text-slate-700 mb-4 text-lg font-semibold">Add Sale</h2>
            <form onSubmit={submitSale} className="flex flex-col gap-3">
              <input type="date" name="date" value={salesForm.date} onChange={handleSalesChange} className="p-3 border-2 border-slate-300 rounded-md" required />
              <input type="number" step="0.01" name="amount" value={salesForm.amount} onChange={handleSalesChange} placeholder="Amount" className="p-3 border-2 border-slate-300 rounded-md" required />
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-500">{loading ? 'Saving...' : 'Save Sale'}</button>
            </form>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-700 m-0 text-xl font-semibold">Sales Over Time</h2>
              <button onClick={fetchCharts} className="bg-slate-700 text-white px-3 py-1.5 rounded-md text-sm">Refresh</button>
            </div>
            <div className="h-64">
              <Line data={salesChart} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Visitors Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-slate-50 p-6 rounded-xl shadow">
            <h2 className="text-slate-700 mb-4 text-lg font-semibold">Add Visitors</h2>
            <form onSubmit={submitVisitors} className="flex flex-col gap-3">
              <input type="date" name="date" value={visitorsForm.date} onChange={handleVisitorsChange} className="p-3 border-2 border-slate-300 rounded-md" required />
              <input type="number" name="count" value={visitorsForm.count} onChange={handleVisitorsChange} placeholder="Count" className="p-3 border-2 border-slate-300 rounded-md" required />
              <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:bg-gray-500">{loading ? 'Saving...' : 'Save Visitors'}</button>
            </form>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-700 m-0 text-xl font-semibold">Visitors Over Time</h2>
              <button onClick={fetchCharts} className="bg-slate-700 text-white px-3 py-1.5 rounded-md text-sm">Refresh</button>
            </div>
            <div className="h-64">
              <Bar data={visitorsChart} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-slate-50 p-6 rounded-xl shadow">
            <h2 className="text-slate-700 mb-4 text-lg font-semibold">Add Category Stat</h2>
            <form onSubmit={submitCategory} className="flex flex-col gap-3">
              <input type="text" name="category" value={categoryForm.category} onChange={handleCategoryChange} placeholder="Category" className="p-3 border-2 border-slate-300 rounded-md" required />
              <input type="number" step="0.01" name="value" value={categoryForm.value} onChange={handleCategoryChange} placeholder="Value" className="p-3 border-2 border-slate-300 rounded-md" required />
              <button type="submit" disabled={loading} className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 disabled:bg-gray-500">{loading ? 'Saving...' : 'Save Category'}</button>
            </form>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-700 m-0 text-xl font-semibold">Category Distribution</h2>
              <button onClick={fetchCharts} className="bg-slate-700 text-white px-3 py-1.5 rounded-md text-sm">Refresh</button>
            </div>
            {/* Reduced size doughnut */}
            <div className="h-56">
              <Doughnut data={categoriesChart} options={{ ...chartOptions, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>

        {/* Extra Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-700 m-0 text-xl font-semibold">Sales vs Visitors</h2>
              <button onClick={fetchCharts} className="bg-slate-700 text-white px-3 py-1.5 rounded-md text-sm">Refresh</button>
            </div>
            <div className="h-64">
              <Line data={combinedTimeseries} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-700 m-0 text-xl font-semibold">Categories (Bar)</h2>
              <button onClick={fetchCharts} className="bg-slate-700 text-white px-3 py-1.5 rounded-md text-sm">Refresh</button>
            </div>
            <div className="h-64">
              <Bar data={categoriesBar} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
