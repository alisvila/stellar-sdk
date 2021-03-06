/// <reference types="node" />
import { AssetType, MemoType } from "stellar-base";
export declare namespace Horizon {
    interface ResponseLink {
        href: string;
        templated?: boolean;
    }
    interface BaseResponse<T extends string = never> {
        _links: {
            [key in T | "self"]: ResponseLink;
        };
    }
    interface SubmitTransactionResponse {
        hash: string;
        ledger: number;
        envelope_xdr: string;
        result_xdr: string;
        result_meta_xdr: string;
    }
    interface TransactionResponse extends SubmitTransactionResponse, BaseResponse<"account" | "ledger" | "operations" | "effects" | "succeeds" | "precedes"> {
        created_at: string;
        fee_meta_xdr: string;
        fee_paid: number;
        id: string;
        memo_type: MemoType;
        memo?: string;
        operation_count: number;
        paging_token: string;
        signatures: string[];
        source_account: string;
        source_account_sequence: string;
    }
    interface BalanceLineNative {
        balance: string;
        asset_type: AssetType.native;
        buying_liabilities: string;
        selling_liabilities: string;
    }
    interface BalanceLineAsset<T extends AssetType.credit4 | AssetType.credit12 = AssetType.credit4 | AssetType.credit12> {
        balance: string;
        limit: string;
        asset_type: T;
        asset_code: string;
        asset_issuer: string;
        buying_liabilities: string;
        selling_liabilities: string;
        last_modified_ledger: number;
    }
    type BalanceLine<T extends AssetType = AssetType> = T extends AssetType.native ? BalanceLineNative : T extends AssetType.credit4 | AssetType.credit12 ? BalanceLineAsset<T> : BalanceLineNative | BalanceLineAsset;
    interface PriceR {
        numerator: number;
        denominator: number;
    }
    interface PriceRShorthand {
        n: number;
        d: number;
    }
    interface AccountThresholds {
        low_threshold: number;
        med_threshold: number;
        high_threshold: number;
    }
    interface Flags {
        auth_immutable: boolean;
        auth_required: boolean;
        auth_revocable: boolean;
    }
    interface AccountSigner {
        key: string;
        weight: number;
        type: string;
    }
    interface AccountResponse extends BaseResponse<"transactions" | "operations" | "payments" | "effects" | "offers" | "trades" | "data"> {
        id: string;
        paging_token: string;
        account_id: string;
        sequence: string;
        subentry_count: number;
        thresholds: AccountThresholds;
        flags: Flags;
        balances: BalanceLine[];
        signers: AccountSigner[];
        data: {
            [key: string]: string;
        };
    }
    enum OperationResponseType {
        createAccount = "create_account",
        payment = "payment",
        pathPayment = "path_payment",
        createPassiveOffer = "create_passive_offer",
        manageOffer = "manage_offer",
        setOptions = "set_options",
        changeTrust = "change_trust",
        allowTrust = "allow_trust",
        accountMerge = "account_merge",
        inflation = "inflation",
        manageData = "manage_data",
        bumpSequence = "bump_sequence"
    }
    enum OperationResponseTypeI {
        createAccount = 0,
        payment = 1,
        pathPayment = 2,
        createPassiveOffer = 3,
        manageOffer = 4,
        setOptions = 5,
        changeTrust = 6,
        allowTrust = 7,
        accountMerge = 8,
        inflation = 9,
        manageData = 10,
        bumpSequence = 11
    }
    interface BaseOperationResponse<T extends OperationResponseType = OperationResponseType, TI extends OperationResponseTypeI = OperationResponseTypeI> extends BaseResponse<"succeeds" | "precedes" | "effects" | "transaction"> {
        id: string;
        paging_token: string;
        source_account: string;
        type: T;
        type_i: TI;
        created_at: string;
        transaction_hash: string;
    }
    interface CreateAccountOperationResponse extends BaseOperationResponse<OperationResponseType.createAccount, OperationResponseTypeI.createAccount> {
        account: string;
        funder: string;
        starting_balance: string;
    }
    interface PaymentOperationResponse extends BaseOperationResponse<OperationResponseType.payment, OperationResponseTypeI.payment> {
        from: string;
        to: string;
        asset_type: AssetType;
        asset_code?: string;
        asset_issuer?: string;
        amount: string;
    }
    interface PathPaymentOperationResponse extends BaseOperationResponse<OperationResponseType.pathPayment, OperationResponseTypeI.pathPayment> {
        from: string;
        to: string;
        asset_type: AssetType;
        asset_code?: string;
        asset_issuer?: string;
        amount: string;
        source_asset_type: AssetType;
        source_asset_code?: string;
        source_asset_issuer?: string;
        source_max: string;
        source_amount: string;
    }
    interface ManageOfferOperationResponse extends BaseOperationResponse<OperationResponseType.manageOffer, OperationResponseTypeI.manageOffer> {
        offer_id: number;
        amount: string;
        buying_asset_type: AssetType;
        buying_asset_code?: string;
        buying_asset_issuer?: string;
        price: string;
        price_r: PriceR;
        selling_asset_type: AssetType;
        selling_asset_code?: string;
        selling_asset_issuer?: string;
    }
    interface PassiveOfferOperationResponse extends BaseOperationResponse<OperationResponseType.createPassiveOffer, OperationResponseTypeI.createPassiveOffer> {
        offer_id: number;
        amount: string;
        buying_asset_type: AssetType;
        buying_asset_code?: string;
        buying_asset_issuer?: string;
        price: string;
        price_r: PriceR;
        selling_asset_type: AssetType;
        selling_asset_code?: string;
        selling_asset_issuer?: string;
    }
    interface SetOptionsOperationResponse extends BaseOperationResponse<OperationResponseType.setOptions, OperationResponseTypeI.setOptions> {
        signer_key?: string;
        signer_weight?: number;
        master_key_weight?: number;
        low_threshold?: number;
        med_threshold?: number;
        high_threshold?: number;
        home_domain?: string;
        set_flags: Array<1 | 2>;
        set_flags_s: Array<"auth_required_flag" | "auth_revocable_flag">;
        clear_flags: Array<1 | 2>;
        clear_flags_s: Array<"auth_required_flag" | "auth_revocable_flag">;
    }
    interface ChangeTrustOperationResponse extends BaseOperationResponse<OperationResponseType.changeTrust, OperationResponseTypeI.changeTrust> {
        asset_type: AssetType.credit4 | AssetType.credit12;
        asset_code: string;
        asset_issuer: string;
        trustee: string;
        trustor: string;
        limit: string;
    }
    interface AllowTrustOperationResponse extends BaseOperationResponse<OperationResponseType.allowTrust, OperationResponseTypeI.allowTrust> {
        asset_type: AssetType;
        asset_code: string;
        asset_issuer: string;
        authorize: boolean;
        trustee: string;
        trustor: string;
    }
    interface AccountMergeOperationResponse extends BaseOperationResponse<OperationResponseType.accountMerge, OperationResponseTypeI.accountMerge> {
        into: string;
    }
    interface InflationOperationResponse extends BaseOperationResponse<OperationResponseType.inflation, OperationResponseTypeI.inflation> {
    }
    interface ManageDataOperationResponse extends BaseOperationResponse<OperationResponseType.manageData, OperationResponseTypeI.manageData> {
        name: string;
        value: Buffer;
    }
    interface BumpSequenceOperationResponse extends BaseOperationResponse<OperationResponseType.bumpSequence, OperationResponseTypeI.bumpSequence> {
        bump_to: string;
    }
    interface ResponseCollection<T extends BaseResponse = BaseResponse> {
        _links: {
            self: ResponseLink;
            next: ResponseLink;
            prev: ResponseLink;
        };
        _embedded: {
            records: T[];
        };
    }
    interface TransactionResponseCollection extends ResponseCollection<TransactionResponse> {
    }
    interface FeeStatsResponse {
        last_ledger: string;
        last_ledger_base_fee: string;
        ledger_capacity_usage: string;
        min_accepted_fee: string;
        mode_accepted_fee: string;
        p10_accepted_fee: string;
        p20_accepted_fee: string;
        p30_accepted_fee: string;
        p40_accepted_fee: string;
        p50_accepted_fee: string;
        p60_accepted_fee: string;
        p70_accepted_fee: string;
        p80_accepted_fee: string;
        p90_accepted_fee: string;
        p95_accepted_fee: string;
        p99_accepted_fee: string;
    }
    type ErrorResponseData = ErrorResponseData.RateLimitExceeded | ErrorResponseData.InternalServerError | ErrorResponseData.TransactionFailed;
    namespace ErrorResponseData {
        interface Base {
            status: number;
            title: string;
            type: string;
            details: string;
            instance: string;
        }
        interface RateLimitExceeded extends Base {
            status: 429;
            title: "Rate Limit Exceeded";
        }
        interface InternalServerError extends Base {
            status: 500;
            title: "Internal Server Error";
        }
        interface TransactionFailed extends Base {
            status: 400;
            title: "Transaction Failed";
            extras: TransactionFailedExtras;
        }
    }
    enum TransactionFailedResultCodes {
        TX_FAILED = "tx_failed",
        TX_BAD_SEQ = "tx_bad_seq",
        TX_BAD_AUTH = "tx_bad_auth",
        TX_BAD_AUTH_EXTRA = "tx_bad_auth_extra"
    }
    interface TransactionFailedExtras {
        envelope_xdr: string;
        result_codes: {
            transaction: TransactionFailedResultCodes;
            operations: string[];
        };
        result_xdr: string;
    }
}
