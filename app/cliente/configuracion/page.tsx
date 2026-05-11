export default function ClientConfigurationPage() {
  return (
    <main className="px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-sm font-medium text-sky-600">Cuenta cliente</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Configuración</h1>
          <p className="mt-2 text-slate-600">
            Aquí podrás revisar datos de perfil, direcciones de entrega y preferencias de compra.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <h2 className="font-medium text-slate-900">Perfil</h2>
            <p className="mt-1 text-sm text-slate-600">Nombre, correo y teléfono.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <h2 className="font-medium text-slate-900">Direcciones</h2>
            <p className="mt-1 text-sm text-slate-600">Entrega para clínica, consultorio o domicilio.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <h2 className="font-medium text-slate-900">Facturación</h2>
            <p className="mt-1 text-sm text-slate-600">Datos fiscales y comprobantes.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <h2 className="font-medium text-slate-900">Preferencias</h2>
            <p className="mt-1 text-sm text-slate-600">Notificaciones, idioma y seguridad.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
