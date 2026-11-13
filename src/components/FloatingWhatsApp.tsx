import { MessageCircle } from "lucide-react"
import { useTranslation } from 'react-i18next'

export default function FloatingWhatsApp({ message }: { message: string }) {
  const { t } = useTranslation()
  return <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" aria-label={t("Quick order on WhatsApp")} className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 border border-border bg-background px-4 py-3 text-sm text-foreground shadow-lg transition-transform hover:-translate-y-1 hover:border-primary hover:text-primary md:bottom-8 md:right-8"><MessageCircle size={18} className="text-primary"/><span>{t("WhatsApp order")}</span></a>
}