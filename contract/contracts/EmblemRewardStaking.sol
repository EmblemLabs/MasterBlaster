//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract EmblemRewardStaking is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Info of each user.
    struct UserInfo {
        uint256 amount;       // How many tokens the user has provided.
        uint256 rewardDebt;   // Reward debt.
    }

    // Info of each pool.
    struct PoolInfo {
        IERC20 stakingToken;
        IERC20 rewardToken;
        uint256 perBlockEmblemAllocated;
        uint256 lastRewardBlock;
        uint256 accEmblemPerShare;
    }

    PoolInfo[] public poolInfo;
    mapping (uint256 => mapping (address => UserInfo)) public userInfo;
    uint256 public startBlock;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event ContractFunded(address indexed from, uint256 amount);

    constructor(
        uint256 _emblemPerBlock,
        uint256 _startBlock
    ) public {
        startBlock = _startBlock;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    function add(uint256 _emblemPerBlock, IERC20 _stakingToken, IERC20 _rewardToken, bool _withUpdate) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        poolInfo.push(PoolInfo({
            stakingToken: _stakingToken,
            rewardToken: _rewardToken,
            perBlockEmblemAllocated: _emblemPerBlock,
            lastRewardBlock: lastRewardBlock,
            accEmblemPerShare: 0
        }));
    }

    function set(uint256 _poolId, uint256 _emblemPerBlock, bool _withUpdate) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        poolInfo[_poolId].perBlockEmblemAllocated = _emblemPerBlock;
    }

    function fund(uint256 _poolId, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_poolId];
        address _from = address(msg.sender);
        require(_from != address(0), 'fund: must pass valid _from address');
        require(_amount > 0, 'fund: expecting a positive non zero _amount value');
        require(pool.rewardToken.balanceOf(_from) >= _amount, 'fund: expected an address that contains enough Emblem for Transfer');
        pool.rewardToken.transferFrom(_from, address(this), _amount);
        emit ContractFunded(_from, _amount);
    }

    function getMultiplier(uint256 _from, uint256 _to) public pure returns (uint256) {
        return _to.sub(_from);
    }

    function pendingEmblemReward(uint256 _poolId, address _user) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_poolId];
        UserInfo storage user = userInfo[_poolId][_user];
        uint256 accEmblemPerShare = pool.accEmblemPerShare;
        uint256 stakingTokenSupply = pool.stakingToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && stakingTokenSupply != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 emblemReward = multiplier.mul(pool.perBlockEmblemAllocated);
            accEmblemPerShare = accEmblemPerShare.add(emblemReward.mul(1e12).div(stakingTokenSupply));
        }
        return user.amount.mul(accEmblemPerShare).div(1e12).sub(user.rewardDebt);
    }

    function harvest(uint256 _poolId) external returns (uint256) {
        PoolInfo storage pool = poolInfo[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];
        updatePool(0);
        console.log('currentBlock', block.number, pool.accEmblemPerShare);
        if (user.amount > 0) {
            uint256 pending = user.amount.mul(pool.accEmblemPerShare).div(1e12).sub(user.rewardDebt);
            safeEmblemTransfer(msg.sender, pending, _poolId);
            return pending;
        }
        return 0;
    }

    function getLockedEmblemView(uint256 _poolId) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_poolId];
        return pool.rewardToken.balanceOf(address(this));
    }

    function getStakingTokenSupply(uint256 _poolId) external view returns (uint256) {
        PoolInfo storage pool = poolInfo[_poolId];
        return pool.stakingToken.balanceOf(address(this));
    }

    //////////////////
    //
    // PUBLIC functions
    //
    //////////////////


    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // Update pool supply and reward variables of the given pool to be up-to-date.
    function updatePool(uint256 _poolId) public {
        PoolInfo storage pool = poolInfo[_poolId];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 stakingTokenSupply = pool.stakingToken.balanceOf(address(this));
        if (stakingTokenSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 emblemReward = multiplier.mul(pool.perBlockEmblemAllocated);
        pool.accEmblemPerShare = pool.accEmblemPerShare.add(emblemReward.mul(1e12).div(stakingTokenSupply));

        pool.lastRewardBlock = block.number;
    }

    // Deposit LP tokens to Contract for RIO allocation.
    function deposit(uint256 _poolId, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_poolId];
        UserInfo storage user = userInfo[_poolId][msg.sender];
        updatePool(_poolId);
        // if user already has LP tokens in the pool execute harvest for the user
        if (user.amount > 0) {
            uint256 pending = user.amount.mul(pool.accEmblemPerShare).div(1e12).sub(user.rewardDebt);
            if (pending > 0) {
                safeEmblemTransfer(msg.sender, pending, _poolId);
            }
        }
        if (_amount > 0) {
            pool.stakingToken.safeTransferFrom(address(msg.sender), address(this), _amount);
            user.amount = user.amount.add(_amount);
        }
        user.rewardDebt = user.amount.mul(pool.accEmblemPerShare).div(1e12);

        emit Deposit(msg.sender, _poolId, _amount);
    }

    // Withdraw LP tokens from Contract.
    function withdraw(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");
        updatePool(_pid);
        uint256 pending = user.amount.mul(pool.accEmblemPerShare).div(1e12).sub(user.rewardDebt);

        if(pending > 0) {
            safeEmblemTransfer(address(msg.sender), pending, _pid);
        }
        if(_amount > 0) {
            user.amount = user.amount.sub(_amount);
            pool.stakingToken.safeTransfer(address(msg.sender), _amount);
        }
        user.rewardDebt = user.amount.mul(pool.accEmblemPerShare).div(1e12);
        emit Withdraw(msg.sender, _pid, _amount);
    }

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        pool.stakingToken.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
    }

    //////////////////
    //
    // INTERNAL functions
    //
    //////////////////

    // Safe RIO transfer function, just in case if rounding error causes pool to not have enough RIOs.
    function safeEmblemTransfer(address _to, uint256 _amount, uint256 _poolId) internal {
        PoolInfo storage pool = poolInfo[_poolId];
        address _from = address(this);
        uint256 emblemBal = pool.rewardToken.balanceOf(_from);
        if (_amount > emblemBal) {
            pool.rewardToken.transfer(_to, emblemBal);
        } else {
            pool.rewardToken.transfer(_to, _amount);
        }
    }
}
