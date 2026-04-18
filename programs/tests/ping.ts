import * as anchor from "@coral-xyz/anchor";

async function main() {
    console.log("🚀 Starting Connection Test...");
    // Force the provider to look at your local validator
    const provider = anchor.AnchorProvider.local("http://127.0.0.1:8899");
    
    try {
        const version = await provider.connection.getVersion();
        console.log("✅ SUCCESS! Connected to Validator Version:", version["solana-core"]);
        console.log("📍 RPC Endpoint:", provider.connection.rpcEndpoint);
    } catch (e) {
        console.error("❌ FAILED to connect to validator. Is it running in the other tab?");
        console.error(e);
    }
}

main();
