-- LINTERSTORE O(N*M)
local l1 = redis.call('LLEN', KEYS[1])
local l2 = redis.call('LLEN', KEYS[2])
local c1 = 0
local c2
local e
local ec = 0

while (c1 < l1) do
  e = redis.call('LINDEX', KEYS[1], c1)
  c2 = 0

  while (c2 < l2) do
    if (e == redis.call('LINDEX', KEYS[2], c2)) then
      redis.call('RPUSH', KEYS[3], e)
      ec = ec+1
      break
    end

    c2 = c2+1
  end

  c1 = c1+1
end

return ec
