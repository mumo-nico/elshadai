"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        userType: "TENANT",
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="space-y-6">
        {/* Logo/Title */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-neon-blue/10 rounded-lg mb-4"
          >
            <User className="w-8 h-8 text-neon-blue" />
          </motion.div>
          <h2 className="text-3xl font-bold text-navy-dark">
            Tenant Login
          </h2>
          <p className="text-gray-500 mt-2">
            Sign in to access your tenant dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Email Address"
              className="pl-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="password"
              placeholder="Password"
              className="pl-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" disabled={isLoading} />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-neon-blue hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Contact Admin */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/contact" className="text-neon-blue hover:underline font-medium">
              Contact Admin
            </a>
          </p>
        </div>
      </div>
    </Modal>
  );
}

