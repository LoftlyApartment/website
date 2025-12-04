/**
 * Test script to verify price ID selection logic
 */

const STRIPE_CONFIG = {
  prices: {
    pro: {
      monthly: 'price_1SMCEeQ1lUJh1eUJAUJZrAen',
      yearly: 'price_1SMCEoQ1lUJh1eUJSiHkukna',
    },
    enterprise: {
      monthly: 'price_1SMCEyQ1lUJh1eUJnEln6Hh8',
      yearly: 'price_1SMCF1Q1lUJh1eUJJfUWrm8U',
    },
  },
};

function getPriceId(tier, period) {
  return STRIPE_CONFIG.prices[tier][period];
}

console.log('Testing price ID selection:\n');

console.log('Pro Monthly:', getPriceId('pro', 'monthly'));
console.log('  Expected: price_1SMCEeQ1lUJh1eUJAUJZrAen');
console.log('  Match:', getPriceId('pro', 'monthly') === 'price_1SMCEeQ1lUJh1eUJAUJZrAen' ? '✓' : '✗');

console.log('\nPro Yearly:', getPriceId('pro', 'yearly'));
console.log('  Expected: price_1SMCEoQ1lUJh1eUJSiHkukna');
console.log('  Match:', getPriceId('pro', 'yearly') === 'price_1SMCEoQ1lUJh1eUJSiHkukna' ? '✓' : '✗');

console.log('\nEnterprise Monthly:', getPriceId('enterprise', 'monthly'));
console.log('  Expected: price_1SMCEyQ1lUJh1eUJnEln6Hh8');
console.log('  Match:', getPriceId('enterprise', 'monthly') === 'price_1SMCEyQ1lUJh1eUJnEln6Hh8' ? '✓' : '✗');

console.log('\nEnterprise Yearly:', getPriceId('enterprise', 'yearly'));
console.log('  Expected: price_1SMCF1Q1lUJh1eUJJfUWrm8U');
console.log('  Match:', getPriceId('enterprise', 'yearly') === 'price_1SMCF1Q1lUJh1eUJJfUWrm8U' ? '✓' : '✗');

console.log('\n\nDatabase shows user has:');
console.log('  stripe_price_id: price_1SMCEeQ1lUJh1eUJAUJZrAen');
console.log('  This is: PRO MONTHLY ✓');
console.log('\nIf they selected monthly and got monthly, the bug might be elsewhere...');
