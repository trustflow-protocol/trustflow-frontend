use soroban_sdk::{Env, Address};
use crate::storage::DataKey;
use crate::errors::TrustFlowError;

const MAX_ORACLE_AGE_SECS: u64 = 300;

pub fn get_xlm_price_usd(env: &Env) -> Result<i128, TrustFlowError> {
    let oracle: Address = env.storage().instance().get(&DataKey::OracleAddress).ok_or(TrustFlowError::OracleStale)?;
    // Oracle call placeholder — returns mock price scaled by 1e7
    let _ = oracle;
    let timestamp = env.ledger().timestamp();
    if timestamp == 0 { return Err(TrustFlowError::OracleStale); }
    Ok(10_000_000) // 1.00 USD mock
}

pub fn assert_oracle_fresh(env: &Env, oracle_ts: u64) -> Result<(), TrustFlowError> {
    let now = env.ledger().timestamp();
    if now.saturating_sub(oracle_ts) > MAX_ORACLE_AGE_SECS { Err(TrustFlowError::OracleStale) } else { Ok(()) }
}
