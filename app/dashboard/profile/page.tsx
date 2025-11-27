"use client";

import { useSession } from "next-auth/react";
import { User, Mail, Phone, Shield, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-navy-dark mb-8">Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-neon-blue to-sky-blue p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <User className="w-12 h-12 text-neon-blue" />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{session.user.name}</h2>
              <p className="text-white/80 capitalize mt-1">
                {session.user.role?.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-neon-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="text-navy-dark font-medium">{session.user.email}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-neon-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <p className="text-navy-dark font-medium capitalize">
                  {session.user.role?.toLowerCase()}
                </p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-neon-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">User ID</p>
                <p className="text-navy-dark font-medium font-mono text-sm">
                  {session.user.id}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-gray-200">
            <button className="px-6 py-3 bg-neon-blue text-white rounded-xl hover:bg-sky-blue transition-colors font-medium">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-navy-dark mb-2">Account Information</h3>
        <p className="text-gray-600 text-sm">
          Your account is active and in good standing. If you need to update your information or have any questions, please contact support.
        </p>
      </div>
    </div>
  );
}

