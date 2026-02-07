use soroban_sdk::{contracttype, Address};

#[contracttype]
pub enum DataKey {
    Admin,
    EscrowCounter,
    Escrow(u64),
    Dispute(u64),
    FeeBps,
    FeeCollector,
    OracleAddress,
    Paused,
}

pub const PERSISTENT_BUMP: u32 = 518_400;
pub const PERSISTENT_THRESHOLD: u32 = 120_960;

pub fn extend_ttl(env: &soroban_sdk::Env, key: &DataKey) {
    if env.storage().persistent().has(key) {
        env.storage().persistent().extend_ttl(key, PERSISTENT_THRESHOLD, PERSISTENT_BUMP);
    }
}
