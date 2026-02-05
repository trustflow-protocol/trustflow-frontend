use soroban_sdk::{contractevent, Address};

#[contractevent]
pub struct EscrowCreated {
    #[topic] pub escrow_id: u64,
    #[topic] pub depositor: Address,
    pub beneficiary: Address,
    pub amount: i128,
}

#[contractevent]
pub struct EscrowReleased {
    #[topic] pub escrow_id: u64,
    pub amount: i128,
    pub released_to: Address,
}

#[contractevent]
pub struct DisputeRaised {
    #[topic] pub escrow_id: u64,
    #[topic] pub raised_by: Address,
}

#[contractevent]
pub struct DisputeResolved {
    #[topic] pub escrow_id: u64,
    pub ruling_for_depositor: bool,
}
