import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { LayoutWithSidebar } from "./components/LayoutWithSidebar"
import { HomePage } from "./pages/HomePage"
import { ReportPage } from "./pages/ReportPage"
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage"
import { TermsOfServicePage } from "./pages/TermsOfServicePage"
import { BlankPage } from "./pages/BlankPage"
import { AboutPage } from "./pages/AboutPage"
import { useState } from "react"
import { Analytics } from "@vercel/analytics/react"

function App() {
  const [reportCount, setReportCount] = useState(0);

  return (
    <>
      <Router>
        <Analytics />
        <Routes>
          <Route path="/" element={<LayoutWithSidebar reportCount={reportCount} setReportCount={setReportCount} />}>
            <Route index element={<HomePage />} />
            <Route path="/report/:id" element={<ReportPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
          <Route path="*" element={<BlankPage />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  )
}

export default App
