import hashlib


def calculate_image_hash(image_path):
    sha256 = hashlib.sha256()

    with open(image_path, "rb") as image_file:
        while True:
            data = image_file.read(4096)

            if not data:
                break

            sha256.update(data)

    return sha256.hexdigest()


if __name__ == "__main__":
    image_path = "uploads/test.jpg"

    image_hash = calculate_image_hash(image_path)

    print("Image:", image_path)
    print("SHA-256 Hash:")
    print(image_hash)