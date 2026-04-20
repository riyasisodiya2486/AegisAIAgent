/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/aegis.json`.
 */
export type Aegis = {
  "address": "EnAS1LC6Rgj993Zt16LwYYSNFWEgRL4VbnarbyRQATAQ",
  "metadata": {
    "name": "aegis",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "accrueYield",
      "discriminator": [
        243,
        28,
        81,
        65,
        175,
        178,
        5,
        112
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault.owner",
                "account": "agentVault"
              },
              {
                "kind": "account",
                "path": "vault.agent_key",
                "account": "agentVault"
              }
            ]
          }
        },
        {
          "name": "config",
          "docs": [
            "Global protocol config — read-only here, just need fee_rate_bps"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "collectFees",
      "discriminator": [
        164,
        152,
        207,
        99,
        30,
        186,
        19,
        182
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault.owner",
                "account": "agentVault"
              },
              {
                "kind": "account",
                "path": "vault.agent_key",
                "account": "agentVault"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "treasury",
          "writable": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "vault.agent_key",
                "account": "agentVault"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "vault"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeProtocolConfig",
      "discriminator": [
        28,
        50,
        43,
        233,
        244,
        98,
        123,
        118
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "The deployer / team keypair — becomes the authority"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "treasury",
          "docs": [
            "Can be any valid pubkey — a multisig, a team wallet, etc."
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeVault",
      "discriminator": [
        48,
        191,
        163,
        44,
        71,
        129,
        63,
        164
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "agentKey"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "agentKey",
          "docs": [
            "just stored as the authorized spender. Validated in spend."
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "dailyLimit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "revokeAgent",
      "discriminator": [
        227,
        60,
        209,
        125,
        240,
        117,
        163,
        73
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "vault.agent_key",
                "account": "agentVault"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "vault"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "spend",
      "discriminator": [
        242,
        205,
        255,
        87,
        101,
        217,
        245,
        57
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault.owner",
                "account": "agentVault"
              },
              {
                "kind": "account",
                "path": "vault.agent_key",
                "account": "agentVault"
              }
            ]
          }
        },
        {
          "name": "agent",
          "signer": true
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "stakeIdleFunds",
      "discriminator": [
        210,
        15,
        49,
        168,
        85,
        27,
        174,
        233
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault.owner",
                "account": "agentVault"
              },
              {
                "kind": "account",
                "path": "vault.agent_key",
                "account": "agentVault"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  45,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "vault"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "unstakeForSpend",
      "discriminator": [
        150,
        30,
        96,
        192,
        68,
        48,
        129,
        129
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "vault.owner",
                "account": "agentVault"
              },
              {
                "kind": "account",
                "path": "vault.agent_key",
                "account": "agentVault"
              }
            ]
          }
        },
        {
          "name": "agent",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "amountNeeded",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateLimit",
      "discriminator": [
        181,
        75,
        36,
        52,
        69,
        92,
        90,
        65
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "vault.agent_key",
                "account": "agentVault"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "vault"
          ]
        }
      ],
      "args": [
        {
          "name": "newLimit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  101,
                  103,
                  105,
                  115,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "vault.agent_key",
                "account": "agentVault"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "vault"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "agentVault",
      "discriminator": [
        232,
        220,
        237,
        164,
        157,
        9,
        215,
        194
      ]
    },
    {
      "name": "protocolConfig",
      "discriminator": [
        207,
        91,
        250,
        28,
        152,
        179,
        215,
        209
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedAgent",
      "msg": "Signer is not the authorized agent for this vault"
    },
    {
      "code": 6001,
      "name": "dailyLimitExceeded",
      "msg": "This transaction would exceed the vault's daily spending limit"
    },
    {
      "code": 6002,
      "name": "insufficientFunds",
      "msg": "Vault has insufficient balance for this transaction"
    },
    {
      "code": 6003,
      "name": "unauthorizedOwner",
      "msg": "Only the vault owner can perform this action"
    },
    {
      "code": 6004,
      "name": "invalidDailyLimit",
      "msg": "Daily limit must be greater than zero"
    },
    {
      "code": 6005,
      "name": "invalidDepositAmount",
      "msg": "Deposit amount must be greater than zero"
    },
    {
      "code": 6006,
      "name": "agentRevoked",
      "msg": "Agent has been revoked — vault is frozen"
    }
  ],
  "types": [
    {
      "name": "agentVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "agentKey",
            "type": "pubkey"
          },
          {
            "name": "dailyLimit",
            "type": "u64"
          },
          {
            "name": "spentToday",
            "type": "u64"
          },
          {
            "name": "lastResetTs",
            "type": "i64"
          },
          {
            "name": "vaultBalance",
            "type": "u64"
          },
          {
            "name": "totalDeposited",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "stakedAmount",
            "type": "u64"
          },
          {
            "name": "yieldEarned",
            "type": "u64"
          },
          {
            "name": "lastYieldTs",
            "type": "i64"
          },
          {
            "name": "yieldRateBps",
            "type": "u16"
          },
          {
            "name": "pendingFee",
            "type": "u64"
          },
          {
            "name": "feeRateBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "protocolConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The wallet that is allowed to call collect_fees"
            ],
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "docs": [
              "Where collected fees are sent"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeRateBps",
            "docs": [
              "Fee rate in basis points — 500 = 5% of yield"
            ],
            "type": "u16"
          },
          {
            "name": "bump",
            "docs": [
              "Bump for this config PDA"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
