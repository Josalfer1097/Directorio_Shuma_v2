import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function OrganigramaPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Organigrama</h1>
      <p className="text-muted-foreground">
        Próximamente disponible.
      </p>
      <Link href="/" className="inline-flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} />
        Regresar al inicio
      </Link>
    </div>
  );
}
