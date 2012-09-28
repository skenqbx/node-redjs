-- LUNIQUESTORE O(N+N*M)
local l1 = redis.call('LLEN', KEYS[1])
local l2 = redis.call('LLEN', KEYS[2])
local c1 = 0
local c2 = 0
local e

while (c1 < l1) do
  redis.call('RPUSH', KEYS[3], redis.call('LINDEX', KEYS[1], c1))
  c1 = c1+1
end

while (c2 < l2) do
  c1 = 0
  e = redis.call('LINDEX', KEYS[2], c2)

  while (c1 < l1) do
    if (e == redis.call('LINDEX', KEYS[1], c1)) then
      e = nil
      break
    end
    c1 = c1+1
  end

  if (e) then
    redis.call('RPUSH', KEYS[3], e)
  end

  c2 = c2+1
end

return redis.call('LLEN', KEYS[3])
