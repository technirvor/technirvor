-- Create admin user with full permissions
-- Email: technirvorbd@gmail.com
-- Password: Tamanna@2025

-- First, let's check if the user already exists and delete if needed
DELETE FROM auth.identities WHERE provider_id = 'technirvorbd@gmail.com' AND provider = 'email';
DELETE FROM admin_users WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'technirvorbd@gmail.com');
DELETE FROM auth.users WHERE email = 'technirvorbd@gmail.com';

-- Create the user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'technirvorbd@gmail.com',
  crypt('Tamanna@2025', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Tech Admin", "role": "super_admin"}',
  FALSE,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Get the user ID for the admin user we just created
DO $$
DECLARE
    admin_user_id UUID;
    new_admin_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'technirvorbd@gmail.com';
    
    -- Create identity record with proper provider_id
    INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        admin_user_id,
        'technirvorbd@gmail.com', -- This is the required provider_id
        jsonb_build_object(
            'sub', admin_user_id::text,
            'email', 'technirvorbd@gmail.com',
            'email_verified', true,
            'phone_verified', false
        ),
        'email',
        NOW(),
        NOW(),
        NOW()
    );
    
    -- Insert into admin_users table with full permissions
    INSERT INTO admin_users (
        id,
        user_id,
        role,
        permissions,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        admin_user_id,
        'super_admin',
        ARRAY[
            'all',
            'products.create',
            'products.read',
            'products.update',
            'products.delete',
            'orders.create',
            'orders.read',
            'orders.update',
            'orders.delete',
            'categories.create',
            'categories.read',
            'categories.update',
            'categories.delete',
            'users.create',
            'users.read',
            'users.update',
            'users.delete',
            'flash_sales.create',
            'flash_sales.read',
            'flash_sales.update',
            'flash_sales.delete',
            'combo_products.create',
            'combo_products.read',
            'combo_products.update',
            'combo_products.delete',
            'analytics.read',
            'settings.update',
            'notifications.manage',
            'admin.manage'
        ],
        TRUE,
        NOW(),
        NOW()
    ) RETURNING id INTO new_admin_id;
    
    -- Log the admin creation if activity logs table exists
    BEGIN
        INSERT INTO admin_activity_logs (
            admin_user_id,
            action,
            resource_type,
            details,
            created_at
        ) VALUES (
            new_admin_id,
            'ADMIN_CREATED',
            'admin_user',
            jsonb_build_object(
                'email', 'technirvorbd@gmail.com',
                'role', 'super_admin',
                'permissions', 'full_access',
                'created_by', 'system'
            ),
            NOW()
        );
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'admin_activity_logs table does not exist, skipping log entry';
    END;
    
    RAISE NOTICE 'Admin user created successfully with email: technirvorbd@gmail.com';
    RAISE NOTICE 'User ID: %', admin_user_id;
    RAISE NOTICE 'Admin ID: %', new_admin_id;
END $$;

-- Verify the admin user was created
SELECT 
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    au.id as admin_id,
    au.role,
    au.permissions,
    au.is_active,
    au.created_at
FROM auth.users u
JOIN admin_users au ON u.id = au.user_id
WHERE u.email = 'technirvorbd@gmail.com';
