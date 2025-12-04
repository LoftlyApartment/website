export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>
        <p className="text-neutral-600">Settings interface coming soon...</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">System Information</h2>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Platform:</span> Loftly Apartment GmbH</p>
          <p><span className="font-medium">Version:</span> 1.0.0</p>
          <p><span className="font-medium">Environment:</span> Production</p>
        </div>
      </div>
    </div>
  );
}
