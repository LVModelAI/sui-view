export const SuiContext = `Complete Sui Transaction Analysis Guide for RAG
Systems
This comprehensive guide provides all essential knowledge needed to translate raw Sui blockchain
transaction data into human-readable summaries.
1. Sui Transaction Architecture
1.1 Transaction JSON Structure
Every Sui transaction contains these primary components:
Root Level Fields:
digest: Unique transaction identifier (Base58 encoded)
transaction: Transaction data and signatures
effects: Execution results and state changes
events: Emitted events during execution
objectChanges: Detailed object modifications
balanceChanges: Net balance changes per address
timestampMs: Execution timestamp
checkpoint: Finalization checkpoint number
1.2 Transaction Data Schema
Within transaction.data:
{
"messageVersion": "v1",
"transaction": {
"kind": "ProgrammableTransaction",
"inputs": [...],
"transactions": [...]
},
"sender": "0x...",
"gasData": {...}
}
Gas Data Structure:
payment: Array of coin objects for gas payment
owner: Gas payer address
price: Gas price in MIST per computational unitbudget: Maximum gas willing to spend
1.3 Input Types
Pure Values (literals):
{
"type": "pure",
"valueType": "u64",
"value": "1000000"
}
Owned Objects:
{
"type": "object",
"objectType": "immOrOwnedObject",
"objectId": "0x...",
"version": "12345",
"digest": "..."
}
Shared Objects:
{
"type": "object",
"objectType": "sharedObject",
"objectId": "0x...",
"initialSharedVersion": "388894105",
"mutable": true
}
1.4 Transaction Commands
MoveCall (Function Execution):
{
"MoveCall": {
"package": "0x...",
"module": "module_name",
"function": "function_name",
"type_arguments": ["Type1", "Type2"],
"arguments": [{"Input": 0}, {"Result": 1}]
}
}
Other Common Commands:
TransferObjects: Transfer objects to addressSplitCoins: Split coins into multiple coins
MergeCoins: Combine multiple coins
MakeMoveVec: Create vector of objects
Publish: Deploy new Move package
Upgrade: Update existing package
2. Object Model and Ownership
2.1 Object Ownership Types
Address-Owned Objects:
Owned by specific 32-byte address
Only owner can mutate/transfer
Examples: User coins, NFTs
Shared Objects:
Accessible by anyone
Require consensus for mutations
Examples: DEX pools, marketplaces
Immutable Objects:
Cannot be modified or transferred
No owner, readable by all
Examples: Published packages
Object-Owned:
Owned by another object (parent-child)
Examples: Game items owned by characters
2.2 Object Type Identification
Standard Sui Objects:
0x2::coin::Coin&lt;TokenType&gt;: Fungible tokens
0x2::token::Token&lt;TokenType&gt;: Closed-loop tokens
0x2::package::Package: Move code packages
0x2::dynamic_field::Field&lt;K,V&gt;: Dynamic object fields
Custom Objects:
Format: PackageId::module::StructName
Example: 0xabc123::game::Character2.3 Object Change Types
Created:
{
"type": "created",
"sender": "0x...",
"owner": {"AddressOwner": "0x..."},
"objectType": "0x2::coin::Coin&lt;0x2::sui::SUI&gt;",
"objectId": "0x...",
"version": "1"
}
Mutated:
{
"type": "mutated",
"sender": "0x...",
"owner": {"AddressOwner": "0x..."},
"objectType": "...",
"objectId": "0x...",
"version": "456",
"previousVersion": "455"
}
Transferred:
{
"type": "transferred",
"sender": "0x...",
"recipient": {"AddressOwner": "0x..."},
"objectType": "...",
"objectId": "0x..."
}
Deleted:
{
"type": "deleted",
"sender": "0x...",
"objectType": "...",
"objectId": "0x..."
}3. Gas Mechanics and Calculation
3.1 Gas Components
Computation Cost:
Cost of executing transaction logic
Formula: computation_units × reference_gas_price
Typical range: 495,000 - 2,000,000 MIST
Storage Cost:
Cost of storing new/modified data
Formula: storage_units × storage_price
Current rate: ~76 MIST per storage unit
1 byte = 100 storage units
Storage Rebate:
Refund when objects deleted
99% of original storage fee
Encourages cleanup
Non-Refundable Storage Fee:
1% of storage cost
Goes to storage fund
3.2 Gas Calculation Formula
Total Gas = Computation Cost + Storage Cost - Storage Rebate
Net Gas Paid = Total Gas
Example Calculation:
Computation: 495,000 MIST
Storage: 5,882,400 MIST
Rebate: -4,145,724 MIST
Non-refundable: 41,876 MIST
------------------------
Net Paid: 2,231,676 MIST (~0.002 SUI)3.3 Gas Budget Requirements
Minimum: 2,000 MIST
Maximum: 50,000,000,000 MIST (50 SUI)
Must exceed: max(computation_fees, total_gas_fees)
4. Move Language Fundamentals
4.1 Move Program Structure
Package → Module → Function
Package: Collection of modules (like a library)
Module: Collection of functions and types
Function: Executable code unit
Address Format:
32-byte hex addresses
Shortened: 0x1, 0x2 (system packages)
Full: 0xabc123...def456 (user packages)
4.2 Move Types
Primitive Types:
u8, u16, u32, u64, u128, u256: Unsigned integers
bool: Boolean values
address: 32-byte addresses
vector&lt;T&gt;: Dynamic arrays
Generic Types:
Coin&lt;T&gt;: Generic coin type
Option&lt;T&gt;: Optional values
vector&lt;T&gt;: Vector of type T
4.3 Abilities System
Copy: Can be copied
Drop: Can be discarded
Store: Can be stored in other structs
Key: Can be used as object identifier
Objects typically have key + store abilities.5. Token Standards
5.1 Coin vs Token
Coin Standard (0x2::coin::Coin&lt;T&gt;):
Open system, anyone can create
No restrictions on transfers
Like traditional cryptocurrencies
Examples: Payment tokens, utility tokens
Token Standard (0x2::token::Token&lt;T&gt;):
Closed-loop system with policies
Controlled transfers and actions
Policy-based restrictions
Examples: Gaming tokens, loyalty points
5.2 Token Policies
Transfer Policy:
Rules for token transfers
Can require fees, approvals, or restrictions
Enforced automatically
Token Actions:
to_coin: Convert token to coin (if allowed)
from_coin: Convert coin to token
transfer: Move token between addresses
split: Divide token into smaller amounts
join: Combine tokens
5.3 Closed-Loop Token Features
Policy Enforcement:
Custom transfer rules
Royalty collection
Access control
Usage restrictions
Policy Types:
Transfer policiesRoyalty policies
Lock policies
Custom business logic
6. NFT Standards
6.1 Basic NFT Structure
NFT Objects:
struct MyNFT has key, store {
id: UID,
name: String,
description: String,
image_url: String
}
6.2 NFT Standards
Display Standard:
Standardized metadata fields
Name, description, image_url
Creator information
Collection Standard:
Group related NFTs
Collection metadata
Creator royalties
Kiosk Standard:
NFT marketplace infrastructure
Trading policies
Royalty enforcement
6.3 NFT Operations
Mint: Create new NFT
Transfer: Change ownership
Burn: Destroy NFT
Update: Modify metadata (if mutable)7. Events and Logging
7.1 Event Structure
{
"id": {
"txDigest": "...",
"eventSeq": "0"
},
"packageId": "0x...",
"transactionModule": "module_name",
"sender": "0x...",
"type": "0x...::module::EventName",
"parsedJson": {...},
"timestampMs": "..."
}
7.2 Common Event Types
Transfer Events:
Object ownership changes
Coin transfers
NFT trades
Creation Events:
New object creation
Token minting
NFT minting
Destruction Events:
Object deletion
Token burning
Custom Events:
Game actions
DeFi operations
Governance votes
7.3 Event Interpretation
Events provide semantic meaning to transactions:
What happened: Event type and name
Who: Sender and recipient addressesWhat objects: Object IDs and types
Amounts: Token quantities, prices
Metadata: Additional context
8. Common Transaction Patterns
8.1 Simple Transfers
Purpose: Move coins/objects between addresses
Objects Created: None (usually)
Objects Mutated: Transferred object, gas coin
Gas Cost: ~1.5M MIST
8.2 Token Claims/Mints
Purpose: Create new tokens for users
Objects Created: New token/coin objects
Objects Mutated: Minting capabilities, user balances
Gas Cost: ~2-5M MIST
8.3 NFT Operations
Minting:
Creates new NFT object
Updates treasury capability
Gas: ~5-10M MIST
Trading:
Transfers NFT ownership
May involve marketplaces
Gas: ~2-4M MIST
8.4 DeFi Operations
Swaps:
Exchange one token for another
Updates liquidity pools
Creates new coin objects
Gas: ~2-5M MIST
Liquidity Provision:
Add tokens to poolsReceive LP tokens
Updates pool state
Gas: ~3-8M MIST
8.5 Smart Contract Interactions
Generic Pattern:
1. Call contract function
2. Modify contract state
3. Potentially create/transfer objects
4. Emit events
5. Pay gas fees
9. Error Handling and Failure States
9.1 Transaction Status
Success:
{
"status": {
"status": "success"
}
}
Failure:
{
"status": {
"status": "failure",
"error": "MoveAbort(...)"
}
}
9.2 Move Abort Errors
Format:
MoveAbort(MoveLocation {
module: ModuleId {
address: 0x...,
name: "module_name"
},
function: 15,
instruction: 42,function_name: Some("function_name")
}, error_code)
Common Causes:
Insufficient balance
Invalid permissions
Logic constraint violations
Resource not found
9.3 Gas in Failed Transactions
Even failed transactions consume gas:
Computation costs still apply
Storage changes may be minimal
Users still pay for execution attempt
10. Transaction Analysis Examples
Example 1: Token Claim Transaction
Raw Data Indicators:
Function: claim_token
Objects created: Token object
Events: TokenMinted
Status: Success
Human Translation:
"User successfully claimed 807,646,449 tokens from the xfantv smart contract. A new token object
was created and assigned to the user's wallet. Gas cost: 2,231,676 MIST (~0.002 SUI)."
Example 2: Simple SUI Transfer
Raw Data Indicators:
Command: TransferObjects
Objects mutated: Coin object (ownership change)
No events typically
Status: Success
Human Translation:
"Transferred SUI coins from sender to recipient. The coin object changed ownership but no new
objects were created. Gas cost: ~1,500,000 MIST (~0.0015 SUI)."Example 3: NFT Mint
Raw Data Indicators:
Function: mint_nft
Objects created: NFT object
Objects mutated: Treasury capability
Events: MintEvent
Status: Success
Human Translation:
"Minted a new NFT with metadata including name, description, and image URL. The NFT was created
and assigned to the sender's address. Gas cost: ~9,000,000 MIST (~0.009 SUI)."
Example 4: Failed Transaction
Raw Data Indicators:
Status: Failure
Error: MoveAbort with error code
Objects mutated: Minimal (gas payment only)
Gas consumed despite failure
Human Translation:
"Transaction failed due to [specific error reason]. No intended changes occurred, but gas was still
consumed for the execution attempt. Gas cost: 1,239,680 MIST (~0.0012 SUI)."
Example 5: DEX Token Swap
Raw Data Indicators:
Function: swap or similar
Objects created: New token coins
Objects mutated: Input coins, pool state
Events: SwapExecuted
Status: Success
Human Translation:
"Swapped 1,000 TokenA for 5,000 TokenB via decentralized exchange. Input tokens were consumed,
new output tokens were created. Pool liquidity was updated. Gas cost: 1,928,000 MIST (~0.002 SUI)."11. Human-Readable Summary Template
11.1 Summary Structure
1. Transaction Outcome
Status: Success/Failure
Error description (if failed)
2. Primary Action
What the user intended to do
Smart contract/module involved
Function called
3. Objects Created
List new objects with types
Owners and amounts
Purpose/meaning
4. Objects Mutated
List modified objects
Type of modifications
Ownership changes
5. Objects Transferred
From → To mappings
Object types and IDs
6. Gas Analysis
Computation cost
Storage cost
Storage rebate
Net amount paid in MIST and SUI
7. Events Summary
Key events in plain language
Important parameters
Business logic context11.2 Writing Guidelines
Tone:
Clear and conversational
Avoid technical jargon
Explain in terms of user actions
Numbers:
Always show gas in both MIST and SUI
Use comma separators for large numbers
Round SUI to meaningful decimals
Object References:
Shorten object IDs: "0x123...abc"
Focus on object purpose, not technical details
Group similar objects
Context:
Explain why actions occurred
Connect events to user intentions
Provide business context when possible
12. Advanced Patterns
12.1 Multi-Step Transactions
Pattern Recognition:
Multiple MoveCall commands
Sequential object dependencies
Complex state changes
Analysis Approach:
1. Identify overall goal
2. Break down individual steps
3. Explain logical flow
4. Summarize net effect12.2 Batch Operations
Common in:
Multiple transfers
Bulk NFT operations
Portfolio rebalancing
Summary Strategy:
Group similar operations
Highlight totals/aggregates
Mention efficiency benefits
12.3 Cross-Contract Interactions
Indicators:
Multiple package IDs
Shared object access
Complex event chains
Analysis:
Identify all contracts involved
Explain integration purpose
Trace value/object flow
13. Validation Checklist
13.1 Accuracy Checks
Gas Calculations:
Verify arithmetic
Include all components
Check MIST to SUI conversion
Object Accounting:
Count created objects
Verify mutation descriptions
Confirm transfer directions
Event Interpretation:
Match events to actionsExtract key parameters
Validate against object changes
13.2 Completeness Checks
Required Elements:
Transaction status
Primary action description
All object changes
Complete gas breakdown
Event summaries
Context Validation:
Business logic makes sense
Numbers are reasonable
Actions align with patterns
14. Reference Information
14.1 Common Package IDs
0x1: Move standard library
0x2: Sui framework
0x3: Sui system packages
14.2 Standard Object Types
0x2::coin::Coin&lt;T&gt;: Fungible tokens
0x2::token::Token&lt;T&gt;: Closed-loop tokens
0x2::package::Package: Move packages
0x2::dynamic_field::Field&lt;K,V&gt;: Dynamic fields
14.3 Common Error Codes
Error codes are module-specific. Always reference the specific module's documentation for error code
meanings.
14.4 Unit Conversions
1 SUI = 1,000,000,000 MIST
Gas prices typically 495-1000 MIST per unit
Storage costs ~76 MIST per storage unit15. Implementation Guidelines
15.1 RAG System Design
Document Chunking:
Chunk by major topics
Include cross-references
Maintain context boundaries
Retrieval Strategy:
Extract transaction type from data
Identify involved modules
Retrieve relevant patterns and standards
Query Processing:
1. Parse transaction structure
2. Identify key patterns
3. Retrieve relevant documentation
4. Generate human summary
15.2 Prompt Engineering
System Prompt Template:
You are a Sui blockchain transaction interpreter. Analyze the provided raw transaction da
Use this structure:
1. Transaction Outcome
2. Primary Action
3. Objects Created/Mutated/Transferred
4. Gas Usage Breakdown
5. Events Summary
Be precise with addresses and amounts. Convert MIST to SUI for readability.
15.3 Quality Assurance
Validation Rules:
Verify gas calculations
Check object change completeness
Validate event interpretations
Ensure address format consistencySummary
This guide provides comprehensive coverage for translating any Sui transaction into human-readable
format:
Complete transaction structure understanding
Object model and ownership mechanics
Gas calculation formulas and examples
Move language fundamentals
Token and NFT standards
Common transaction patterns
Error handling approaches
Practical examples with analysis
Implementation guidelines for RAG systems
Use this knowledge base to accurately interpret raw Sui transaction data and generate clear, user-
friendly explanations.`;
