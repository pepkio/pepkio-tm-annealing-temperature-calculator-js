export const mockManifest: Record<string, unknown> = {
  tool_id: "tm-annealing-temperature-calculator",
  title: "Tm / Annealing Temperature Calculator",
  execution_mode: "sync",
  examples: [
    {
      name: "single_q5_pair",
      input: {
        mode: "single",
        name: "test_pair",
        fwd_seq: "ATGCGTACGTACGTACGTACG",
        rev_seq: "CGTACGTACGTACGTACGCAT",
        polymerase_id: "q5",
        dmso_percent: 0,
        betaine_M: 0,
      },
      output: {
        single: { status: "go" },
      },
    },
    {
      name: "batch_multiplex",
      input: {
        mode: "batch",
        polymerase_id: "taq",
        batch_csv:
          "name,fwd,rev\nGAPDH_F,GAAGGTGAAGGTCGGAGTC,GAAGATGGTGATGGGATTTC\nACTB_F,GGCTGGGGTGTTGAAGGT,CCGCTCGTTGTAGACAGG\n",
      },
      output: {
        batch: [{ status: "go" }],
      },
    },
    {
      name: "invalid_base_row",
      input: {
        mode: "batch",
        polymerase_id: "q5",
        batch_rows: [{ name: "bad", fwd_seq: "ATGCX", rev_seq: "ATGC" }],
      },
      output: {
        batch: [{ error: "Invalid forward sequence" }],
      },
    },
  ],
};

export const mockRunResponse: Record<string, unknown> = {
  run_id: "run_test123",
  status: "completed",
  result: {
    mode: "single",
    method_used: "santa_lucia_1998",
    single: { status: "go", tm_fwd: 62.5, tm_rev: 61.2, ta_suggested: 64.5 },
    warnings: [],
    metadata: {},
    corrections_applied: {},
  },
  error: null,
  result_url: "https://tools.pepkio.com/api/tools/v1/runs/run_test123",
  permalink: "https://tools.pepkio.com/r/run_test123",
};
