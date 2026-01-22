-- Set honza.newage@gmail.com as owner
UPDATE profiles 
SET role = 'owner'
WHERE email = 'honza.newage@gmail.com';

-- Verify the update
SELECT user_id, email, role FROM profiles WHERE email = 'honza.newage@gmail.com';
