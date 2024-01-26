// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "@openzeppelin/contracts-v0.7/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts-v0.7/utils/Counters.sol";
import "@openzeppelin/contracts-v0.7/drafts/IERC20Permit.sol";
import "@openzeppelin/contracts-v0.7/drafts/EIP712.sol";
import "@openzeppelin/contracts-v0.7/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-v0.7/introspection/ERC165.sol";

/**
 * @dev {ERC20} token, including:
 *
 *  - ability for holders to burn (destroy) their tokens
 *  - a minter role that allows for token minting (creation)
 *  - a pauser role that allows to stop all token transfers
 *
 * This contract uses {AccessControl} to lock permissioned functions using the
 * different roles - head to its documentation for details.
 *
 * The account that deploys the contract will be granted the minter and pauser
 * roles, as well as the default admin role, which will let it grant both minter
 * and pauser roles to aother accounts
 */
contract ERC20MinterBurnerPauserPermit is
    ERC20PresetMinterPauser,
    IERC20Permit,
    EIP712,
    ERC165
{
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 decimals_
    )
        public
        ERC20PresetMinterPauser(_name, _symbol)
        EIP712("PermitToken", "1.0")
        ERC165()
    {
        _setupDecimals(decimals_);
        _registerInterface(0x9fd5a6cf); // permit with signature
        _registerInterface(type(IERC20Permit).interfaceId);
        _registerInterface(type(IERC20).interfaceId);
    }

    using Counters for Counters.Counter;

    mapping(address => Counters.Counter) private _nonces;

    // NOTE: delibrately leave it as is to be compatible with v1 storage
    // solhint-disable-next-line var-name-mixedcase
    bytes32 private immutable _PERMIT_TYPEHASH =
        keccak256(
            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        ); // 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        bytes memory signature
    ) public {
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := and(mload(add(signature, 65)), 255)
        }
        if (v < 27) v += 27;
        permit(owner, spender, value, deadline, v, r, s);
    }

    /**
     * @dev Initializes the {EIP712} domain separator using the `name` parameter, and setting `version` to `"1"`.
     *
     * It's a good idea to use the same `name` that is defined as the ERC20 token name.
     */
    // NOTE: delibrately comment out since only constants are allowed in bytecode override
    // constructor(string memory name) EIP712(name, "v1.0") {}

    /**
     * @dev See {IERC20Permit-permit}.
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public override {
        bytes memory signature = abi.encodePacked(r, s, v);
        require(block.timestamp <= deadline, "ERC20Permit: expired deadline");

        bytes32 structHash = keccak256(
            abi.encode(
                _PERMIT_TYPEHASH,
                owner,
                spender,
                value,
                _useNonce(owner),
                deadline
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, signature);
        require(signer == owner, "ERC20Permit: invalid signature");

        _approve(owner, spender, value);
    }

    /**
     * @dev See {IERC20Permit-nonces}.
     */
    function nonces(
        address owner
    ) public view virtual override returns (uint256) {
        return _nonces[owner].current();
    }

    /**
     * @dev See {IERC20Permit-DOMAIN_SEPARATOR}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view override returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @dev "Consume a nonce": return the current value and increment.
     *
     * _Available since v4.1._
     */
    function _useNonce(
        address owner
    ) internal virtual returns (uint256 current) {
        Counters.Counter storage nonce = _nonces[owner];
        current = nonce.current();
        nonce.increment();
    }
}
