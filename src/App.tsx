import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import ScrollToTop from "./components/ScrollToTop"
import { CartProvider } from "@/contexts/CartContext"
import Index from "./pages/Index"
import ProductPage from "./pages/ProductPage"
import AdminPage from "./pages/AdminPage"
import NotFound from "./pages/NotFound"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/login" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
