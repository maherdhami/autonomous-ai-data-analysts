# ForgeAI Platform - Supabase Database Schema Guide

This guide details all settings, tables, SQL triggers, Row Level Security (RLS) policies, and Realtime configurations needed to establish the database environment in Supabase.

---

## 1. Database Schema (SQL DDL Script)
Execute this entire block inside the **Supabase SQL Editor** to create all tables, indexes, and automatic triggers:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS PROFILE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) DEFAULT '',
    subscription_tier VARCHAR(50) DEFAULT 'Free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. PROJECTS (Codebase metadata & state)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description_prompt TEXT NOT NULL,
    model_used VARCHAR(100) DEFAULT 'Claude Sonnet',
    
    -- Real-time compilation state fields
    status VARCHAR(50) DEFAULT 'Running', -- 'Running', 'Completed', 'Failed'
    progress INTEGER DEFAULT 0, -- 0 to 100 percentage
    current_phase VARCHAR(100) DEFAULT 'Initializing', -- 'Generating Requirements', etc.
    
    -- Project configuration and exports
    project_config JSONB DEFAULT '{}'::jsonb, -- e.g., {"backend": "fastapi", "database": "postgres"}
    export_url TEXT, -- Link to downloaded ZIP from Supabase Storage
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure Realtime updates propagate all column details
ALTER TABLE public.projects REPLICA IDENTITY FULL;

-- ==========================================
-- 3. API KEYS CONFIGURATION (Extensible keys)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'google', 'deepseek', etc.
    encrypted_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Prevent duplicate keys per provider per user
    UNIQUE (user_id, provider)
);

-- ==========================================
-- 4. PROJECT ARTIFACTS (Requirements, APIs, etc.)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.project_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    artifact_type VARCHAR(100) NOT NULL, -- 'prd', 'architecture', 'database', 'apis', etc.
    content JSONB NOT NULL, -- JSON formatted data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (project_id, artifact_type)
);

-- ==========================================
-- 5. PROJECT FILES (Source code trees)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL, -- e.g., 'frontend/app/page.tsx'
    file_content TEXT DEFAULT '',
    is_directory BOOLEAN DEFAULT FALSE,
    file_type VARCHAR(50) DEFAULT 'file', -- 'file', 'folder', 'image', 'document'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (project_id, file_path)
);

-- ==========================================
-- 6. USAGE TELEMETRY LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    tokens_used INTEGER DEFAULT 0,
    compile_latency_seconds DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 2. Performance Indexes
To ensure fast loading speeds for developer dashboards and code explorers:

```sql
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_project_id ON public.project_artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
```

---

## 3. Database Triggers

### A. Sync Supabase Auth to Public Users
Runs on every user signup:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, subscription_tier)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        'Free'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### B. Automatic `updated_at` Timestamp Updater
Updates the modification dates whenever user or project rows change:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 4. Security (Row Level Security & Policies)
Restrict access boundaries so users can only view/write their own records:

```sql
-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------
-- 1. Users policies
-- ----------------------------------------------------------
CREATE POLICY "Users can manage their own profile data"
ON public.users
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------
-- 2. Projects policies
-- ----------------------------------------------------------
CREATE POLICY "Users can manage their own projects"
ON public.projects
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------
-- 3. API Keys policies
-- ----------------------------------------------------------
CREATE POLICY "Users can manage their own API keys"
ON public.api_keys
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------
-- 4. Project Artifacts policies
-- ----------------------------------------------------------
CREATE POLICY "Users can manage artifacts of their own projects"
ON public.project_artifacts
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE public.projects.id = project_id AND public.projects.user_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE public.projects.id = project_id AND public.projects.user_id = auth.uid()
));

-- ----------------------------------------------------------
-- 5. Project Files policies
-- ----------------------------------------------------------
CREATE POLICY "Users can manage files of their own projects"
ON public.project_files
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE public.projects.id = project_id AND public.projects.user_id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE public.projects.id = project_id AND public.projects.user_id = auth.uid()
));

-- ----------------------------------------------------------
-- 6. Usage Logs policies
-- ----------------------------------------------------------
CREATE POLICY "Users can view their own token usage telemetry logs"
ON public.usage_logs
FOR SELECT
USING (auth.uid() = user_id);
```

---

## 5. Storage Bucket Configuration
To store generated project export files (ZIPs, PDF specs):

1. Open your **Supabase Dashboard** and go to **Storage**.
2. Click **Create bucket**.
3. Name the bucket exactly `exports`.
4. Set the bucket to **Private** (or **Public** depending on access preferences).
5. Add a Storage Policy to allow developers to retrieve/upload files in the bucket:
   - **Allowed action**: `ALL`
   - **Policy logic**: `auth.uid() IS NOT NULL` (authenticated developers can write/retrieve generated files).
