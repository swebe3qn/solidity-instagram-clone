pragma solidity ^0.5.0;

contract Decentragram {
  string public name = 'Decentragram';

  event ImageCreated(
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

  event ImageTipped(
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

  // Store images
  struct Image {
    uint id;
    string hash;
    string description;
    uint tipAmount;
    address payable author;
  }

  uint public imageCount;
  mapping(uint => Image) public images;

  // Create images
  function uploadImage(string memory _imgHash, string memory _description) public {
    require(bytes(_imgHash).length > 0, 'No image hash');
    require(bytes(_description).length > 0, 'No description');
    require(msg.sender != address(0), 'No author');
    images[imageCount] = Image(imageCount, _imgHash, _description, 0, msg.sender);
    emit ImageCreated(
      images[imageCount].id,
      images[imageCount].hash,
      images[imageCount].description,
      images[imageCount].tipAmount,
      images[imageCount].author
    );
    imageCount++;
  }

  // Tip images
  function tipImageOwner(uint _id) public payable {
    require(_id >= 0 && _id < imageCount, '_id is not valid');
    Image memory image = images[_id];
    images[_id].tipAmount += msg.value;
    address payable author = image.author;
    author.transfer(msg.value);
    emit ImageTipped(image.id, image.hash, image.description, image.tipAmount, image.author);
  }
}