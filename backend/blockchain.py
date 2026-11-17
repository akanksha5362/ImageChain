import hashlib
import json
import os
from datetime import datetime

from backend.image_hasher import calculate_image_hash


BLOCKCHAIN_FILE = "blockchain.json"
DIFFICULTY = 4


class Block:
    def __init__(
        self,
        index,
        timestamp,
        image_hash,
        previous_hash,
        nonce=0,
        hash_value=None
    ):
        self.index = index
        self.timestamp = timestamp
        self.image_hash = image_hash
        self.previous_hash = previous_hash
        self.nonce = nonce

        if hash_value:
            self.hash = hash_value
        else:
            self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_data = {
            "index": self.index,
            "timestamp": self.timestamp,
            "image_hash": self.image_hash,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }

        block_string = json.dumps(
            block_data,
            sort_keys=True
        )

        return hashlib.sha256(
            block_string.encode()
        ).hexdigest()

    def mine_block(self, difficulty):
        target = "0" * difficulty

        while not self.hash.startswith(target):
            self.nonce += 1
            self.hash = self.calculate_hash()

    def to_dict(self):
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "image_hash": self.image_hash,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
            "hash": self.hash
        }


class Blockchain:
    def __init__(self):
        self.chain = []

        if os.path.exists(BLOCKCHAIN_FILE):
            self.load_chain()
        else:
            self.create_genesis_block()
            self.save_chain()

    def create_genesis_block(self):
        genesis_block = Block(
            index=0,
            timestamp=str(datetime.now()),
            image_hash="GENESIS",
            previous_hash="0"
        )

        self.chain.append(genesis_block)

    def add_block(self, image_hash):
        previous_block = self.chain[-1]

        new_block = Block(
            index=len(self.chain),
            timestamp=str(datetime.now()),
            image_hash=image_hash,
            previous_hash=previous_block.hash
        )

        new_block.mine_block(DIFFICULTY)

        self.chain.append(new_block)

        self.save_chain()

    def save_chain(self):
        with open(BLOCKCHAIN_FILE, "w") as file:
            json.dump(
                [block.to_dict() for block in self.chain],
                file,
                indent=4
            )

    def load_chain(self):
        with open(BLOCKCHAIN_FILE, "r") as file:
            blockchain_data = json.load(file)

        self.chain = []

        for block_data in blockchain_data:
            block = Block(
                index=block_data["index"],
                timestamp=block_data["timestamp"],
                image_hash=block_data["image_hash"],
                previous_hash=block_data["previous_hash"],
                nonce=block_data["nonce"],
                hash_value=block_data["hash"]
            )

            self.chain.append(block)

    def is_chain_valid(self):
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]

            if current_block.hash != current_block.calculate_hash():
                return False

            if current_block.previous_hash != previous_block.hash:
                return False

            if not current_block.hash.startswith("0" * DIFFICULTY):
                return False

        return True

    def verify_image(self, image_hash):
        for block in self.chain:
            if block.image_hash == image_hash:
                return block

        return None