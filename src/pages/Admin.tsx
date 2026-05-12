import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import content from "../data/content.json";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || "images";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setStatus(error.message);
    setLoading(false);
  };

  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas context failed");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject("Conversion failed");
          }, "image/webp", 0.8);
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setStatus("Processing images...");

    const files = Array.from(e.target.files);
    let successCount = 0;

    for (const file of files) {
      try {
        const webpBlob = await convertToWebP(file);
        const fileName = file.name.split(".")[0] + ".webp";
        
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, webpBlob, {
            contentType: "image/webp",
            upsert: true
          });

        if (error) throw error;
        successCount++;
        setStatus(`Uploaded ${successCount}/${files.length}...`);
      } catch (error: any) {
        console.error("Upload error:", error);
        setStatus(`Error: ${error.message}`);
      }
    }

    setUploading(false);
    setStatus(`Successfully uploaded ${successCount} images!`);
  };

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/10 p-8 shadow-highlight">
          <div className="flex flex-col items-center text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight">{content.title} Admin</h2>
            <p className="mt-2 text-white/60">Enter your credentials to manage the gallery</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4 rounded-md shadow-sm">
              <input
                type="email"
                required
                className="relative block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 placeholder:text-white/30 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                required
                className="relative block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 placeholder:text-white/30 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-lg bg-white px-3 py-3 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
            {status && <p className="text-center text-sm text-red-400">{status}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-black p-4 text-white">
      <div className="w-full max-w-4xl space-y-8 py-12">
        <div className="flex items-center justify-between border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 text-white/60">Logged in as {session.user.email}</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            Sign Out
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Upload Section */}
          <div className="rounded-2xl bg-white/10 p-8 shadow-highlight">
            <h3 className="text-xl font-semibold">Upload Images</h3>
            <p className="mt-2 text-sm text-white/60">Images will be automatically converted to WebP</p>
            
            <div className="mt-6">
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 transition hover:bg-white/10">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-2 text-sm text-white/60">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-white/40">PNG, JPG, WEBP, AVIF</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            {status && (
              <div className={`mt-4 rounded-lg p-3 text-sm ${status.includes("Error") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                {status}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/10 p-8 shadow-highlight">
              <h3 className="text-xl font-semibold">Quick Actions</h3>
              <div className="mt-6 space-y-4">
                <button
                  onClick={() => navigate("/")}
                  className="flex w-full items-center justify-between rounded-lg bg-white/5 px-4 py-3 transition hover:bg-white/10"
                >
                  <span>View Gallery</span>
                  <span className="text-white/40">→</span>
                </button>
                <p className="text-xs text-white/40 italic">
                  Note: After uploading, you must run the build script locally or wait for the next deployment to see changes in the gallery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
