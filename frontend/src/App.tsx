import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
              <h1 className="text-4xl font-bold text-primary mb-4">
                KSP AI Crime Investigation System
              </h1>
              <p className="text-muted-foreground">
                Welcome to the production-ready architecture.
              </p>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
