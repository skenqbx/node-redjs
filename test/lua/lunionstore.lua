-- LUNIONSTORE O(N+M)
local c = 0
local i = redis.call('LLEN', KEYS[1])

while (i > 0) do
  redis.call('RPUSH', KEYS[3], redis.call('LINDEX', KEYS[1], c))
  c = c+1
  i = i-1
end

i = redis.call('LLEN', KEYS[2])
c = 0

while (i > 0) do
  redis.call('RPUSH', KEYS[3], redis.call('LINDEX', KEYS[2], c))
  c = c+1
  i = i-1
end

return redis.call('LLEN', KEYS[3])
